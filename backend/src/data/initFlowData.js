/* eslint-disable no-console */
const config = require('config');
const moment = require('moment-timezone');
const { groupBy, omit, indexBy, map } = require('ramda');
const { MongoClient } = require('mongodb');

const { getPlants } = require('.');
const { chunkAndChainPromises } = require('../utils/helpers');
const { getFlows } = require('../hydroApi');

const uri = config.get('mongoDb.uri');
const dbName = config.get('mongoDb.dbName');

moment.tz('Europe/Paris');

async function getAllFlowPlantData(plant, startYear, endYear) {
  console.log(plant.id, plant.oldHydroPositionCode);
  const yearFlowData = await getFlows(
    plant.oldHydroPositionCode,
    startYear,
    endYear,
  );

  return yearFlowData.map(item => ({
    plantId: plant.id,
    source: 'HYDRO',
    ...item,
  }));
}

async function getAllFlowData(startYear, endYear) {
  const plants = await getPlants();
  const plantsWithHistoric = plants.filter(plant => plant.hasHydroHistoric);
  const historicFlowByPlant = await chunkAndChainPromises(
    plantsWithHistoric,
    p => getAllFlowPlantData(p, startYear, endYear),
    1,
  );
  const allData = [].concat(...historicFlowByPlant);
  const allDataByDate = groupBy(item => item.date, allData);

  return Object.keys(allDataByDate).map(date => {
    const itemByPlant = indexBy(v => v.plantId, allDataByDate[date]);

    return {
      date: new Date(date),
      values: map(omit(['date', 'plantId']), itemByPlant),
    };
  });
}

async function insertAllYearPlantFlows(allHistoricFlows) {
  const mongoClient = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });
  const db = mongoClient.db(dbName);
  const unavailabilities = db.collection('flows');
  await unavailabilities.dropIndexes();
  await unavailabilities.deleteMany({});
  await unavailabilities.createIndex({ date: 1 }, { unique: true });
  await unavailabilities.insertMany(allHistoricFlows);
  await mongoClient.close();
}

const START_YEAR = 2012;

async function main() {
  console.log(process.env.NODE_ENV);
  console.log(uri);
  console.log(dbName);

  const endYear = moment().year();

  const allHistoricFlows = await getAllFlowData(START_YEAR, endYear);
  await insertAllYearPlantFlows(allHistoricFlows);

  console.log('Done');
}

if (require.main === module) {
  main();
}

module.exports = {
  getAllFlowData,
};
