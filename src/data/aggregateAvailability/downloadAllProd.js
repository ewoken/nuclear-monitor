const fs = require('fs');

const moment = require('moment-timezone');
const { range, indexBy } = require('ramda');

const { getRessource, fetchToken } = require('../../rteApi');
const { chunkAndChainPromises } = require('../../utils/helpers');
const { reactors } = require('../index');

function getCacheFile(eicCode, year) {
  return `./cache/${eicCode}-${year}.json`;
}

async function downloadYearProd(eicCode, year, token) {
  const name = getCacheFile(eicCode, year);

  if (fs.existsSync(name)) {
    return Promise.resolve();
  }

  const startYear = moment()
    .year(year)
    .startOf('year');
  const endYear = moment()
    .year(year + 1)
    .startOf('year');

  const last = 3;
  const periodCount = Math.ceil(endYear.diff(startYear, 'days', true) / last);
  const periods = Array.from({ length: periodCount }).map((_, i) => ({
    startDate: moment(startYear).add(i * last, 'days'),
    endDate:
      i === periodCount - 1
        ? moment(endYear)
        : moment(startYear).add((i + 1) * last, 'days'),
  }));

  const data = await chunkAndChainPromises(
    periods,
    ({ startDate, endDate }) =>
      getRessource({
        ressource: 'actual_generation/v1/actual_generations_per_unit',
        params: {
          start_date: startDate.format(),
          end_date: endDate.format(),
          unit_eic_code: eicCode,
        },
        token,
      }).then(d => d.actual_generations_per_unit[0].values),
    5,
  );
  const res = [].concat(...data).map(slot => ({
    startDate: moment(slot.start_date).toISOString(),
    endDate: moment(slot.end_date).toISOString(),
    value: slot.value,
  }));

  fs.writeFileSync(name, JSON.stringify(res, null, 2));

  return new Promise(resolve => setTimeout(resolve, 10000));
}

async function main() {
  const years = range(2016, 2020);
  const token = await fetchToken();

  const d = years.map(year => {
    return reactors.map(reactor => ({
      name: reactor.name,
      eicCode: reactor.eicCode,
      year,
    }));
  });

  const d2 = [].concat(...d);
  await chunkAndChainPromises(
    d2,
    item => downloadYearProd(item.eicCode, item.year, token, true),
    1,
  );
}

function getAllProd() {
  const years = range(2016, 2020);

  return years.reduce((acc, year) => {
    const data = reactors.reduce((acc2, reactor) => {
      return {
        ...acc2,
        [reactor.eicCode]: indexBy(
          d => d.startDate,
          JSON.parse(
            fs.readFileSync(getCacheFile(reactor.eicCode, year), 'utf8'),
          ),
        ),
      };
    }, {});

    return {
      ...acc,
      [year]: data,
    };
  }, {});
}

if (require.main === module) {
  moment.tz.setDefault('Europe/Paris');

  main();
}

module.exports = {
  getAllProd,
};
