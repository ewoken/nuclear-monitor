const moment = require('moment-timezone');
const { uniqBy, transpose, mergeAll, omit } = require('ramda');

const { getRessource, DATE_FORMAT } = require('./rteApi');

let prodCache = {};
async function getProductions({ rteToken, logger }) {
  const key = `PROD${moment().format('YYYYMMDDHH')}`;

  if (prodCache[key]) {
    logger.info('getProductions: cache HIT');
    return prodCache[key];
  }
  prodCache = {};

  const data = await getRessource({
    ressource: 'actual_generation/v1/actual_generations_per_unit',
    token: rteToken,
  });

  const productions = data.actual_generations_per_unit
    .filter(d => d.unit.production_type === 'NUCLEAR')
    .map(reactor => ({
      eicCode: reactor.unit.eic_code,
      values: reactor.values.map(value => ({
        startDate: value.start_date,
        endDate: value.end_date,
        updatedDate: value.updated_date,
        value: value.value,
      })),
    }));

  prodCache[key] = productions;

  return productions;
}

async function getUnavailabilities({ rteToken }) {
  const data = await getRessource({
    ressource:
      'unavailability_additional_information/v1/generation_unavailabilities',
    params: {
      date_type: 'APPLICATION_DATE',
      start_date: moment()
        .tz('Europe/Paris')
        .startOf('day')
        .format(DATE_FORMAT),
      end_date: moment()
        .tz('Europe/Paris')
        .startOf('day')
        .add(1, 'day')
        .format(DATE_FORMAT),
    },
    token: rteToken,
  });

  const now = moment().tz('Europe/Paris');
  const res = uniqBy(d => d.identifier, data.generation_unavailabilities)
    .filter(d => d.production_type === 'NUCLEAR' && !d.status)
    .filter(d => now.isAfter(d.start_date) && now.isBefore(d.end_date))
    .map(d => ({
      id: d.identifier,
      version: Number(d.version),
      updatedAt: d.updated_date,
      startDate: d.start_date,
      endDate: d.end_date,
      type: d.type,
      eicCode: d.unit.eic_code,
      reason: d.reason,
      availablePower_MW: d.values[0].value,
    }));

  return res;
}

let mixCache = {};
const map = {
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
async function getMix({ rteToken, logger }) {
  const now = moment();
  const quarter = Math.floor(now.minutes() / 15);
  const key = `PROD${now.format('YYYYMMDDHH')}-${quarter}`;

  if (mixCache[key]) {
    logger.info('getMix: cache HIT');
    return mixCache[key];
  }
  mixCache = {};

  const [data, data2] = await Promise.all([
    getRessource({
      ressource: 'actual_generation/v1/generation_mix_15min_time_scale',
      params: {
        start_date: moment()
          .tz('Europe/Paris')
          .startOf('day')
          .format(DATE_FORMAT),
        end_date: moment()
          .tz('Europe/Paris')
          .startOf('day')
          .add(1, 'day')
          .format(DATE_FORMAT),
      },
      token: rteToken,
    }),
    getRessource({
      ressource: 'consumption/v1/short_term',
      params: {
        type: 'REALISED',
      },
      token: rteToken,
    }),
  ]);

  const a = data.generation_mix_15min_time_scale
    .filter(d => d.production_subtype === 'TOTAL')
    .map(d =>
      d.values.map(i => ({
        startDate: i.start_date,
        endDate: i.end_date,
        [map[d.production_type]]: i.value,
      })),
    );
  const b = data2.short_term[0].values.map(d => ({
    startDate: d.start_date,
    endDate: d.end_date,
    consumption: d.value,
  }));

  // remove extra conso values
  const c = b.length > a[0].length ? b.slice(a[0].length - 1) : b;

  a.push(c);

  const mix = transpose(a)
    .map(mergeAll)
    .map(d => ({
      ...omit(['exchange'])(d),
      imports: Math.max(0, d.exchange),
      exports: Math.min(0, d.exchange),
    }));

  mixCache[key] = mix;

  return mix;
}

module.exports = {
  getProductions,
  getUnavailabilities,
  getMix,
};
