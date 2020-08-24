const moment = require('moment-timezone');

const { assertInput } = require('../utils/helpers');
const { getRessource } = require('../rteApi');

const getMix = require('./getMix');
const { DateInput, OtherUnavalabiliesInput } = require('./types');

async function getProductions(input, { rteToken, logger, cache }) {
  const dateInput = assertInput(DateInput, input);
  const date = moment(dateInput.date).tz('Europe/Paris');
  const now = moment().tz('Europe/Paris');
  const isToday = date.isSame(now, 'day');
  const isCitrouille = isToday && now.hours() <= 2;

  const key = `PROD-${date.format('YYYY-MM-DD-HH')}`;
  const cacheRes = cache.getValue(key);

  if (cacheRes) {
    logger.info('getProductions: cache HIT');
    return cacheRes;
  }

  const data = await getRessource({
    ressource: 'actual_generation/v1/actual_generations_per_unit',
    params: {
      start_date: moment(date)
        .startOf('day')
        .subtract(isCitrouille ? 1 : 0, 'day')
        .format(),
      end_date: moment(date)
        .startOf('day')
        .add(isToday ? 1 : 2, 'day')
        .format(),
    },
    token: rteToken,
  });

  const offset = isCitrouille ? 23 : 0;
  const productions = data.actual_generations_per_unit
    .filter(d => d.unit.production_type === 'NUCLEAR')
    .map(reactor => ({
      eicCode: reactor.unit.eic_code,
      values: reactor.values.slice(offset, 25 + offset).map(value => ({
        startDate: value.start_date,
        endDate: value.end_date,
        updatedDate: value.updated_date,
        value: value.value,
      })),
    }));

  const res = {
    date: date.format('YYYY-MM-DD'),
    productions,
  };

  cache.setValue(key, res, 5 * 60 * 1000);

  return res;
}

async function getUnavailabilities(input, { db }) {
  const dateInput = assertInput(DateInput, input);
  const date = moment(dateInput.date).startOf('day');
  const unavailabilities = db.collection('unavailabilities');

  const res = unavailabilities
    .find({
      startDate: {
        $lt: moment(date)
          .add(1, 'day')
          .toDate(),
      },
      endDate: { $gt: date.toDate() },
      status: { $ne: 'CANCELLED' },
    })
    .toArray();

  return res;
}

async function getNextUnavailabilities(input, { db }) {
  const { eicCode, skip, limit, date } = assertInput(
    OtherUnavalabiliesInput,
    input,
  );
  const mDate = moment(date);
  const unavailabilities = db.collection('unavailabilities');

  const cursor = await unavailabilities.find({
    startDate: { $gt: mDate.toDate() },
    status: { $ne: 'CANCELLED' },
    ...(eicCode ? { eicCode } : {}),
  });

  const total = await cursor.count();
  const data = await cursor
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    total,
    data,
  };
}

async function getFinishedUnavailabilities(input, { db }) {
  const { eicCode, skip, limit, date } = assertInput(
    OtherUnavalabiliesInput,
    input,
  );
  const mDate = moment(date);
  const unavailabilities = db.collection('unavailabilities');

  const cursor = await unavailabilities.find({
    endDate: { $lt: mDate.toDate() },
    status: { $ne: 'CANCELLED' },
    ...(eicCode ? { eicCode } : {}),
  });

  const total = await cursor.count();
  const data = await cursor
    .sort({ endDate: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    total,
    data,
  };
}

module.exports = {
  getProductions,
  getUnavailabilities,
  getNextUnavailabilities,
  getFinishedUnavailabilities,
  getMix,
};
