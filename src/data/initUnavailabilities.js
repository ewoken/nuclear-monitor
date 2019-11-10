const { MongoClient } = require('mongodb');
const moment = require('moment-timezone');
const config = require('config');

const { uniqBy } = require('ramda');

const { getRessource, fetchToken, DATE_FORMAT } = require('../rteApi');

const { chunkAndChainPromises } = require('../utils/helpers');

const uri = config.get('mongoDb.uri');
const dbName = config.get('mongoDb.dbName');

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

async function main() {
  console.log(process.env.NODE_ENV);
  console.log(uri);
  console.log(dbName);
  const mongoClient = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });
  const token = await fetchToken();

  const db = mongoClient.db(dbName);
  const unavailabilities = db.collection('unavailabilities');

  const weekCount = moment().diff(START_DATE, 'weeks');
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

  await unavailabilities.dropIndexes();
  await unavailabilities.deleteMany({});
  await unavailabilities.createIndex({ id: 1, version: 1 }, { unique: true });

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

  const data2 = uniqBy(d => `${d.id}--${d.version}`, [].concat(...data));

  await unavailabilities.insertMany(data2);

  console.log('Done');

  return mongoClient.close();
}

if (require.main === module) {
  main();
}

module.exports = {
  unavailabilitiesFormatter,
};
