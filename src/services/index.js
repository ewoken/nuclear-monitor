const moment = require('moment-timezone');
const { uniqBy } = require('ramda');

const { assertInput } = require('../utils/helpers');
const { getRessource, DATE_FORMAT } = require('../rteApi');

const getMix = require('./getMix');
const { DateInput } = require('./types');

async function getProductions(input, { rteToken, logger, cache }) {
  const dateInput = assertInput(DateInput, input);
  const date = moment(dateInput.date).tz('Europe/Paris');
  const isToday = date.isSame(moment().tz('Europe/Paris'), 'day');
  const isCitrouille = isToday && date.hour() < 1;

  const key = `PROD-${date.format('YYYY-MM-DD-HH')}`;
  const cacheRes = cache.getValue(key);

  if (cacheRes) {
    logger.info('getProductions: cache HIT');
    return cacheRes;
  }

  const data = await getRessource({
    ressource: 'actual_generation/v1/actual_generations_per_unit',
    params: {
      start_date: moment(date)
        .startOf('day')
        .subtract(isCitrouille ? 1 : 0, 'day')
        .format(),
      end_date: moment(date)
        .startOf('day')
        .add(isToday ? 1 : 2, 'day')
        .format(),
    },
    token: rteToken,
  });

  const offset = isCitrouille ? 23 : 0;
  const productions = data.actual_generations_per_unit
    .filter(d => d.unit.production_type === 'NUCLEAR')
    .map(reactor => ({
      eicCode: reactor.unit.eic_code,
      values: reactor.values.slice(offset, 25 + offset).map(value => ({
        startDate: value.start_date,
        endDate: value.end_date,
        updatedDate: value.updated_date,
        value: value.value,
      })),
    }));

  const res = {
    date: date.format('YYYY-MM-DD'),
    productions,
  };

  cache.setValue(key, res, 5 * 60 * 1000);

  return res;
}

async function getUnavailabilities(input, { rteToken }) {
  const dateInput = assertInput(DateInput, input);
  const date = moment(dateInput.date).tz('Europe/Paris');

  const data = await getRessource({
    ressource:
      'unavailability_additional_information/v1/generation_unavailabilities',
    params: {
      date_type: 'APPLICATION_DATE',
      start_date: moment(date)
        .startOf('day')
        .format(DATE_FORMAT),
      end_date: moment(date)
        .startOf('day')
        .add(1, 'day')
        .format(DATE_FORMAT),
    },
    token: rteToken,
  });

  const res = uniqBy(d => d.identifier, data.generation_unavailabilities)
    .filter(d => d.production_type === 'NUCLEAR' && d.status !== 'CANCELLED')
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
      status: d.status,
    }))
    .filter(
      d =>
        moment(date).isAfter(d.startDate) && moment(date).isBefore(d.endDate),
    );

  return res;
}

module.exports = {
  getProductions,
  getUnavailabilities,
  getMix,
};
