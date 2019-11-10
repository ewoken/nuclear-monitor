const moment = require('moment-timezone');

const { getRessource } = require('../rteApi');
const { unavailabilitiesFormatter } = require('../data/initUnavailabilities');

async function updateUnavailabies(environment) {
  const { logger, db, rteToken } = environment;
  logger.info('Update unavailabilities');

  const unavailabilities = db.collection('unavailabilities');

  const lastUpdate = await unavailabilities.findOne(
    {},
    { sort: { updatedAt: -1 }, limit: 1 },
  );
  const lastDate = moment(lastUpdate.updatedAt).tz('Europe/Paris');

  const data = await getRessource({
    ressource:
      'unavailability_additional_information/v1/generation_unavailabilities',
    params: {
      start_date: moment(lastDate)
        .startOf('day')
        .format(),
      end_date: moment()
        .tz('Europe/Paris')
        .endOf('day')
        .format(),
      date_type: 'UPDATED_DATE',
    },
    token: rteToken,
  });

  const newUpdates = unavailabilitiesFormatter(data).filter(d =>
    moment(d.updatedAt).isAfter(lastDate),
  );

  if (newUpdates.length > 0) {
    const res = await unavailabilities.insertMany(newUpdates);

    logger.info(`${res.insertedCount} new unavailabilities inserted`);
  }
}

module.exports = {
  f: updateUnavailabies,
  interval: 5 * 60 * 1000, // 5 min
};
