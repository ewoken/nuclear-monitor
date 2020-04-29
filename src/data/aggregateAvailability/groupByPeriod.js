const moment = require('moment-timezone');

const { sortBy } = require('ramda');

const { floorHalfHour, ceilHalfHour } = require('./utils');

/**
 * This function group intersected unvailabilities by reactor
 * @param {Unavailabilites} unavailabilities
 */
function groupByPeriod(unavailabilities) {
  // sort in order to help merge
  const sortedUnavailabilities = sortBy(
    u => moment(u.startDate).unix(),
    unavailabilities,
  );

  return sortedUnavailabilities.reduce((acc, unavailability) => {
    const startDate = floorHalfHour(unavailability.startDate);
    const endDate = ceilHalfHour(unavailability.endDate);

    const period = acc.find(
      p =>
        p.eicCode === unavailability.eicCode &&
        startDate.isBefore(p.endDate) &&
        endDate.isAfter(p.startDate),
    );

    const powerUpdates = unavailability.updates.filter(
      u => !!u.availablePower_MW,
    );

    const max = Math.max(
      unavailability.availablePower_MW,
      ...powerUpdates.map(d => d.availablePower_MW),
    );
    const newUnav = {
      ...unavailability,
      updates: powerUpdates,
    };

    if (period) {
      const newPeriod = {
        startDate: moment
          .min(startDate, moment(period.startDate))
          .toISOString(),
        endDate: moment.max(endDate, moment(period.endDate)).toISOString(),
        eicCode: unavailability.eicCode,
        availablePower_MW: Math.max(period.availablePower_MW, max),
        unavailabilities: [...period.unavailabilities, newUnav],
      };
      return [...acc.filter(p => p !== period), newPeriod];
    }

    acc.push({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      eicCode: unavailability.eicCode,
      unavailabilities: [newUnav],
      availablePower_MW: max,
    });

    return acc;
  }, []);
}

module.exports = groupByPeriod;
