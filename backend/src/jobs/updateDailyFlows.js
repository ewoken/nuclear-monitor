const moment = require('moment-timezone');
const { indexBy, groupBy, map, omit } = require('ramda');
const { getLast30DaysFlow } = require('../vigicrueApi');
const { chunkAndChainPromises } = require('../utils/helpers');
const { getPlants } = require('../data/');

async function getFlowPlantData(plant) {
  console.log(plant.id, plant.hydroPositionCode);
  const yearFlowData = await getLast30DaysFlow(plant.hydroPositionCode);

  return yearFlowData.map(item => ({
    plantId: plant.id,
    source: 'VIGICRUE',
    ...item,
  }));
}

async function getFlowData() {
  const plants = await getPlants();
  const plantsWithHistoric = plants.filter(plant =>
    Boolean(plant.hydroPositionCode),
  );
  const historicFlowByPlant = await chunkAndChainPromises(
    plantsWithHistoric,
    p => getFlowPlantData(p),
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

async function updateDailyFlows(environment) {
  const { logger, db } = environment;

  logger.info('updateDailyFlows starts');

  const newData = await getFlowData();
  const dates = newData.map(d => d.date);

  const currentData = await db
    .collection('flows')
    .find({
      date: {
        $in: dates,
      },
    })
    .toArray();
  const currentDataByDate = indexBy(
    d => moment(d.date).format('YYYY-MM-DD'),
    currentData,
  );

  const writes = newData.reduce((acc, item) => {
    const currentItem =
      currentDataByDate[moment(item.date).format('YYYY-MM-DD')];

    if (!currentItem) {
      acc.push({ insertOne: { document: item } });
      return acc;
    }

    let update = false;

    Object.keys(item.values).forEach(plantId => {
      if (
        !currentItem.values[plantId] ||
        currentItem.values[plantId].value === null
      ) {
        update = true;
        currentItem.values[plantId] = item.values[plantId];
      }
    });

    if (update) {
      acc.push({
        updateOne: { filter: { date: item.date }, replacement: currentItem },
      });
    }
    return acc;
  }, []);

  if (writes.length > 0) {
    const res = await db.collection('flows').bulkWrite(writes);
    logger.info('updateDailyFlows', res);
  }
  logger.info('updateDailyFlows ends');
}

module.exports = {
  f: updateDailyFlows,
  interval: 3600 * 1000,
};
