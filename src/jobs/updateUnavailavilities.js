const moment = require('moment-timezone');
const { omit, groupBy, values, sortBy } = require('ramda');

const { getRessource } = require('../rteApi');
const {
  unavailabilitiesFormatter,
  computeNewUnavailability,
} = require('../data/initUnavailabilities');

function buildSecondLastUpdate(updates) {
  return updates.reduce(
    (res, update) => ({
      ...res,
      ...update,
    }),
    {},
  );
}

const omitVersion = omit(['version']);

async function updateUnavailabies(environment) {
  const { logger, db, rteToken } = environment;
  logger.info('Update unavailabilities');

  const unavailabilities = db.collection('unavailabilities');

  const lastUpdatedUnavailability = await unavailabilities.findOne(
    {},
    { sort: { updatedAt: -1 }, limit: 1 },
  );
  const lastDate = moment(lastUpdatedUnavailability.updatedAt).tz(
    'Europe/Paris',
  );

  // const lastDate = moment('2019-12-01').tz('Europe/Paris');

  const data = await getRessource({
    ressource:
      'unavailability_additional_information/v1/generation_unavailabilities',
    params: {
      start_date: moment(lastDate)
        .startOf('day')
        .format(),
      end_date: moment()
        .tz('Europe/Paris')
        .startOf('day')
        .add(1, 'day')
        .format(),
      date_type: 'UPDATED_DATE',
    },
    token: rteToken,
  });

  const newUpdates = unavailabilitiesFormatter(data).filter(d =>
    moment(d.updatedAt).isAfter(lastDate),
  );

  if (newUpdates.length > 0) {
    const currentUnavailabilities = await unavailabilities
      .find({
        id: { $in: newUpdates.map(u => u.id) },
      })
      .toArray();

    const updatesById = groupBy(u => u.id, newUpdates);

    const newUnavailabilities = values(updatesById).map(updates => {
      const unavailability = currentUnavailabilities.find(
        u => u.id === updates[0].id,
      );

      if (!unavailability) {
        return computeNewUnavailability(updates);
      }

      const lastUpdate = omit(['updates', '_id'], unavailability);
      const sorted = sortBy(d => d.version, updates).map(omitVersion);

      if (unavailability.updates.length > 0) {
        const secondLastUpdate = buildSecondLastUpdate(unavailability.updates);
        const res = computeNewUnavailability(
          [secondLastUpdate, lastUpdate, ...sorted],
          true,
        );

        return {
          ...res,
          updates: [...unavailability.updates, ...res.updates.slice(1)],
        };
      }

      return computeNewUnavailability([lastUpdate, ...sorted], true);
    });

    const writeOperations = newUnavailabilities.map(unavailability => ({
      replaceOne: {
        filter: { id: unavailability.id },
        replacement: unavailability,
        upsert: true,
      },
    }));

    const res = await unavailabilities.bulkWrite(writeOperations);

    logger.info(`${res.upsertedCount + res.modifiedCount} updates added`);
  }
}

module.exports = {
  f: updateUnavailabies,
  interval: 5 * 60 * 1000, // 5 min
};
