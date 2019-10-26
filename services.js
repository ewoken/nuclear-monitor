const moment = require('moment-timezone');
const { uniqBy } = require('ramda');

const { getRessource, DATE_FORMAT } = require('./rteApi');

const cache = {};

async function getProductions({ logger, rteToken }) {
  const oldKey = `PROD${moment()
    .subtract(1, 'hour')
    .format('YYYYMMDDHH')}`;
  const key = `PROD${moment().format('YYYYMMDDHH')}`;

  if (cache[key]) {
    logger.info('CACHE HIT');
    return cache[key];
  }

  const data = await getRessource({
    ressource: 'actual_generation/v1/actual_generations_per_unit',
    token: rteToken,
  });

  if (!data.actual_generations_per_unit) {
    throw new Error('RTE');
  }

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

  delete cache[oldKey];
  cache[key] = productions;

  return productions;
}

async function getUnavailabilities({ logger, rteToken }) {
  const oldKey = `UNA${moment()
    .subtract(1, 'hour')
    .format('YYYYMMDDHH')}`;
  const key = `UNA${moment().format('YYYYMMDDHH')}`;

  if (cache[key]) {
    logger.info('CACHE HIT');
    return cache[key];
  }

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

  if (!data.generation_unavailabilities) {
    throw new Error('RTE');
  }

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

  delete cache[oldKey];
  cache[key] = res;

  return res;
}

// async function main() {
//   const rteToken = await fetchToken();
//   await new Promise(resolve => setTimeout(resolve, 500));
//   const data = await getUnavailabilities({ rteToken });

//   const res = data.generation_unavailabilities.filter(
//     d => d.production_type === 'NUCLEAR' && !d.status,
//   );
//   const res2 = uniqBy(d => d.identifier, res);

//   console.log(JSON.stringify(res2, null, 2));
// }

// main();

module.exports = {
  getProductions,
  getUnavailabilities,
};
