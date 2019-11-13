const moment = require('moment-timezone');
const { uniqBy } = require('ramda');

const { getRessource, DATE_FORMAT } = require('./rteApi');

let cache = {};
async function getProductions({ rteToken, logger }) {
  const key = `PROD${moment().format('YYYYMMDDHH')}`;

  if (cache[key]) {
    logger.info('getProductions: cache HIT');
    return cache[key];
  }
  cache = {};

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

  cache[key] = productions;

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

module.exports = {
  getProductions,
  getUnavailabilities,
};
