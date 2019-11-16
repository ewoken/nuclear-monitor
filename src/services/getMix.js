const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { transpose, mergeAll, omit } = require('ramda');
const qs = require('qs');

const { assertInput } = require('../utils/helpers');
const { getRessource } = require('../rteApi');

const { DateInput } = require('./types');

const TYPE_MAPPING = {
  BIOENERGY: 'bioenergy',
  EXCHANGE: 'exchange',
  FOSSIL_GAS: 'gas',
  FOSSIL_HARD_COAL: 'coal',
  FOSSIL_OIL: 'oil',
  HYDRO: 'hydro',
  NUCLEAR: 'nuclear',
  WIND: 'wind',
  SOLAR: 'solar',
  PUMPING: 'hydroPumped',
};
const DATE2017 = moment('2017-01-01T00:00:00Z').tz('Europe/Paris');
const API_URL = 'https://opendata.reseaux-energies.fr/api/records/1.0/search/';
const OLD_TTL = 3600 * 1000; // 1h ;
const TODAY_TTL = 20 * 60 * 1000; // 20 min;

async function getOldMix(inputDate) {
  const date = moment(inputDate).startOf('day');

  const interval = [
    date.format('YYYY-MM-DD'),
    moment(date)
      .add(1, 'day')
      .format('YYYY-MM-DD'),
  ];

  // fetch all values of previous day and asked day
  const url = `${API_URL}?${qs.stringify({
    dataset: 'eco2mix-national-cons-def',
    rows: 97, // add first quarter of next day
    sort: '-date_heure',
    // 'refine.date': date.format('YYYY-MM-DD'),
    q: `date_heure >= ${interval[0]} AND date_heure <= ${interval[1]}`,
    timezone: 'Europe/Paris',
  })}`;

  const response = await fetch(url);
  const data = await response.json();
  const mix = data.records.map(({ fields }) => ({
    wind: Number(fields.eolien),
    solar: Math.max(Number(fields.solaire), 0),
    nuclear: Number(fields.nucleaire),
    gas: Number(fields.gaz),
    oil: Number(fields.fioul),
    coal: Number(fields.charbon),
    consumption: Number(fields.consommation),
    bioenergy: Number(fields.bioenergies),
    hydroPumped: Number(fields.pompage),
    hydro: Number(fields.hydraulique),
    imports: Math.max(0, Number(fields.ech_physiques)),
    exports: Math.min(0, Number(fields.ech_physiques)),
  }));

  const keys = Object.keys(mix[0]);

  // interpolation
  for (let i = 1; i < mix.length; i += 2) {
    keys.forEach(key => {
      mix[i][key] = Math.floor((mix[i - 1][key] + mix[i + 1][key]) / 2);
    });
  }
  // mix.pop(); // remove first quarter of next day;

  return mix.map((v, i) => ({
    start_date: moment(date)
      .add(i * 15, 'minutes')
      .format(),
    end_date: moment(date)
      .add((i + 1) * 15, 'minutes')
      .format(),
    ...v,
  }));
}

async function getNewMix({ date, rteToken, isToday }) {
  const dateData = {
    start_date: moment(date)
      .startOf('day')
      .format(),
    end_date: moment(date)
      .startOf('day')
      .add(isToday ? 1 : 2, 'day')
      .format(),
  };

  const [data, data2] = await Promise.all([
    getRessource({
      ressource: 'actual_generation/v1/generation_mix_15min_time_scale',
      params: dateData,
      token: rteToken,
    }),
    getRessource({
      ressource: 'consumption/v1/short_term',
      params: {
        type: 'REALISED',
        ...dateData,
      },
      token: rteToken,
    }),
  ]);

  const valuesByTypeArray = data.generation_mix_15min_time_scale
    .filter(d => d.production_subtype === 'TOTAL')
    .map(d =>
      d.values.slice(0, 97).map(i => ({
        startDate: i.start_date,
        endDate: i.end_date,
        [TYPE_MAPPING[d.production_type]]: i.value,
      })),
    );

  const consumptionValues = data2.short_term[0].values.slice(0, 97).map(d => ({
    startDate: d.start_date,
    endDate: d.end_date,
    consumption: d.value,
  }));

  // remove extra conso values
  const formattedConsumptionValues =
    consumptionValues.length > valuesByTypeArray[0].length
      ? consumptionValues.slice(valuesByTypeArray[0].length - 1)
      : consumptionValues;

  valuesByTypeArray.push(formattedConsumptionValues);

  const mix = transpose(valuesByTypeArray)
    .map(mergeAll)
    .map(d => ({
      ...omit(['exchange'])(d),
      imports: Math.max(0, d.exchange),
      exports: Math.min(0, d.exchange),
    }));

  return mix;
}

async function getMix(input, { rteToken, logger, cache }) {
  const dateInput = assertInput(DateInput, input);
  const date = moment(dateInput.date).tz('Europe/Paris');
  const isOld = date.isBefore(DATE2017);
  const isToday = date.isSame(moment().tz('Europe/Paris'), 'day');

  const quarter = Math.floor(date.minutes() / 15);
  const key = isToday
    ? `MIX-${date.format('YYYY-MM-DD-HH')}-${quarter}`
    : `MIX-OLD-${date.format('YYYY-MM-DD')}`;
  const ttl = isToday ? TODAY_TTL : OLD_TTL;
  const cacheRes = cache.getValue(key);

  if (cacheRes) {
    logger.info(`CACHE HIT: ${key}`);
    return cacheRes;
  }

  const mix = await (isOld
    ? getOldMix(date)
    : getNewMix({ date, rteToken, isToday }));

  const res = {
    date: date.format('YYYY-MM-DD'),
    mix,
  };

  cache.setValue(key, res, ttl);

  return res;
}

module.exports = getMix;
