const moment = require('moment-timezone');
const { indexBy } = require('ramda');
const { getAllFlowData } = require('../data/initFlowData');

async function updateHistoricFlows(environment) {
  const { logger, db } = environment;

  logger.info('updateHistoricFlows starts');

  const currentYear = moment().year();
  const newData = await getAllFlowData(currentYear - 1, currentYear);
  const currentData = await db
    .collection('flows')
    .find({
      date: {
        $gte: moment()
          .startOf('year')
          .subtract(1, 'year')
          .toDate(),
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
        item.values[plantId].value !== null &&
        (!currentItem.values[plantId] ||
          currentItem.values[plantId].value === null ||
          currentItem.values[plantId].source === 'VIGICRUE')
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
    logger.info('updateHistoricFlows', res);
  }
  logger.info('updateHistoricFlows ends');
}

module.exports = {
  f: updateHistoricFlows,
  interval: 48 * 3600 * 1000,
};
