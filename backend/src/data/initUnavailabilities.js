// const fs = require('fs');
const { MongoClient } = require('mongodb');
const moment = require('moment-timezone');
const config = require('config');

const {
  groupBy,
  values,
  sortBy,
  equals,
  pickBy,
  uniqBy,
  aperture,
  omit,
} = require('ramda');

const { getRessource, fetchToken, DATE_FORMAT } = require('../rteApi');

const { chunkAndChainPromises } = require('../utils/helpers');

const uri = config.get('mongoDb.uri');
const dbName = config.get('mongoDb.dbName');

moment.tz('Europe/Paris');

const START_DATE = moment('2010-12-15');

function unavailabilitiesFormatter(data) {
  return data.generation_unavailabilities
    .filter(d => d.production_type === 'NUCLEAR')
    .map(d => ({
      id: d.identifier,
      version: Number(d.version),
      updatedAt: moment(d.updated_date).toDate(),
      startDate: moment(d.start_date).toDate(),
      endDate: d.end_date ? moment(d.end_date).toDate() : null,
      type: d.type,
      eicCode: d.unit.eic_code,
      reason: d.reason,
      status: d.status,
      availablePower_MW: d.values[0].value,
    }));
}

async function getAllUnavailabilities() {
  const weekCount = moment().diff(START_DATE, 'weeks') + 1;
  const weeks = Array.from({ length: weekCount }).map((_, i) => ({
    startDate: moment(START_DATE)
      .startOf('day')
      .add(i, 'weeks')
      .format(DATE_FORMAT),
    endDate: moment(START_DATE)
      .add(i, 'weeks')
      .add(6, 'days')
      .endOf('day')
      .format(DATE_FORMAT),
  }));
  let i = 0;

  const token = await fetchToken();
  const data = await chunkAndChainPromises(
    weeks,
    week =>
      getRessource({
        ressource:
          'unavailability_additional_information/v1/generation_unavailabilities',
        params: {
          start_date: week.startDate,
          end_date: week.endDate,
        },
        token,
      }).then(weekData => {
        if (!weekData.generation_unavailabilities) {
          console.log(weekData);
          throw new Error('RTE');
        }

        console.log(`${i}/${weekCount}`);
        i += 1;

        return unavailabilitiesFormatter(weekData);
      }),
    10,
  );

  // const data = JSON.parse(fs.readFileSync('./data.json'));

  return data.reduce((res, item) => res.concat(item), []);
}

const f = omit(['updatedAt']);
function computeNewUnavailability(
  unavailabilityUpdates,
  alreadySorted = false,
) {
  const sorted = alreadySorted
    ? unavailabilityUpdates
    : sortBy(
        d => d.version,
        uniqBy(d => `${d.id}__${d.version}`, unavailabilityUpdates),
      ).map(omit(['version']));
  const last = sorted.pop();

  const formatted = sorted
    .filter(u => !equals(f(u), f(last))) // remove false update
    .map(omit(['id', 'eicCode', 'type'])); // remove useless fields

  // compute updates
  const updates = aperture(2, formatted).map(([init, update]) => {
    return pickBy((v, key) => !equals(v, init[key]), update);
  });

  return {
    ...last,
    updates: formatted.length > 1 ? [formatted[0], ...updates] : formatted,
  };
}

async function insertUnavailabities(data) {
  const mongoClient = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });
  const db = mongoClient.db(dbName);
  const unavailabilities = db.collection('unavailabilities');
  await unavailabilities.dropIndexes();
  await unavailabilities.deleteMany({});
  await unavailabilities.createIndex({ id: 1 }, { unique: true });
  await unavailabilities.insertMany(data);
  await mongoClient.close();
}

async function main() {
  console.log(process.env.NODE_ENV);
  console.log(uri);
  console.log(dbName);

  const unavailabilities = await getAllUnavailabilities();

  const unavailabilityUpdatesById = groupBy(d => d.id, unavailabilities);
  const newUnavailabilities = values(unavailabilityUpdatesById).map(v =>
    computeNewUnavailability(v),
  );

  await insertUnavailabities(newUnavailabilities);

  console.log('Done');
}

if (require.main === module) {
  main();
}

module.exports = {
  computeNewUnavailability,
  unavailabilitiesFormatter,
};
