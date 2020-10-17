const fs = require('fs');

const { MongoClient } = require('mongodb');
const moment = require('moment-timezone');
const config = require('config');
const { sortBy, groupBy, mergeAll } = require('ramda');

const { toCSV } = require('./utils');
const groupByPeriod = require('./groupByPeriod');
const { getAllProd } = require('./downloadAllProd');
const periodToSlots = require('./periodsToSlots');
const mergePeriodSlots = require('./mergePeriodSlots');

const { reactors } = require('../index');

const uri = config.get('mongoDb.uri');
const dbName = config.get('mongoDb.dbName');

moment.tz.setDefault('Europe/Paris');

async function main() {
  const mongoClient = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });
  const db = mongoClient.db(dbName);
  const unavailabilities = db.collection('unavailabilities');

  console.info('Load prod data');
  const prodData = getAllProd();
  console.info('Prod data loaded');

  const startAll = '2015-01-01';
  const endAll = '2020-01-01';

  const allUnavailabilities = await unavailabilities
    .find({
      status: { $ne: 'CANCELLED' },
      startDate: { $lt: new Date(endAll) },
      endDate: { $gte: new Date(startAll) },
    })
    .toArray();

  console.info('group by period');
  const periods = groupByPeriod(allUnavailabilities).map(period => ({
    ...period,
    startDate: moment.max(moment(period.startDate), moment(startAll)),
    endDate: moment.min(moment(period.endDate), moment(endAll)),
  }));

  // debugJSON('./test.json', periods.slice(1700, 1800));

  console.info(`${periods.length} periods to slots`);
  const periodSlots = periods.map((period, i) => {
    if (i % 100 === 0) {
      console.info(`${i}`);
    }

    return periodToSlots(period, prodData);
  });

  const periodSlotsByReactor = groupBy(p => p.eicCode, periodSlots);

  console.info('by reactor part');
  const reactorSlots = [].concat(
    ...reactors.map(reactor => {
      console.info(reactor.name);
      const reactorPeriodSlots = sortBy(
        p => moment(p.startDate).unix(),
        periodSlotsByReactor[reactor.eicCode],
      );
      const slots = mergePeriodSlots({
        startDate: startAll,
        endDate: endAll,
        periodSlots: reactorPeriodSlots,
        reactor,
      });

      return slots.map(slot => ({
        startDate: slot.startDate,
        endDate: slot.endDate,
        [reactor.name]: slot.value,
      }));
    }),
  );

  console.info('group hour');
  const slotByHours = groupBy(s => s.startDate, reactorSlots);
  const slots = Object.values(slotByHours).map(items => mergeAll(items));

  const result = sortBy(
    s => moment(s.startDate).unix(),
    slots.map(slot => ({
      ...slot,
      total: reactors.reduce((sum, reactor) => sum + slot[reactor.name], 0),
      full_available: reactors.filter(r => r.netPower_MW === slot[r.name])
        .length,
      stopped: reactors.filter(r => slot[r.name] === 0).length,
    })),
  );

  fs.writeFileSync('./result.csv', toCSV(result, Object.keys(result[0])));

  await mongoClient.close();
}

if (require.main === module) {
  main();
}
