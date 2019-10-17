const moment = require('moment-timezone');

const { getRessource } = require('./rteApi');

const cache = {};

async function getProductions({ logger, rteToken }) {
  const oldKey = moment()
    .subtract(1, 'hour')
    .format('YYYYMMDDHH');
  const key = moment().format('YYYYMMDDHH');

  if (cache[key]) {
    logger.info('CACHE HIT');
    return cache[key];
  }

  const data = await getRessource({
    ressource: 'actual_generation/v1/actual_generations_per_unit',
    token: rteToken,
  });
  const productions = data.actual_generations_per_unit
    .filter(d => d.unit.production_type === 'NUCLEAR')
    .map(reactor => ({
      eicCode: reactor.unit.eic_code,
      values: reactor.values,
    }));

  delete cache[oldKey];
  cache[key] = productions;

  return productions;
}

module.exports = {
  getProductions,
};
