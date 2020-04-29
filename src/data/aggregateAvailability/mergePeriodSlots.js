const { generateSlots } = require('./utils');

// periodSlots should be sorted
function mergePeriodSlots({ startDate, endDate, periodSlots, reactor }) {
  const availablePower = reactor.netPower_MW;

  const firstSlots = generateSlots(
    startDate,
    periodSlots[0].startDate,
    availablePower,
  );

  return periodSlots.reduce((acc, periodSlot, i) => {
    const intervalSlots = generateSlots(
      periodSlot.endDate,
      i === periodSlots.length - 1 ? endDate : periodSlots[i + 1].startDate,
      availablePower,
    );

    return acc.concat(periodSlot.slots, intervalSlots);
  }, firstSlots);
}

module.exports = mergePeriodSlots;
