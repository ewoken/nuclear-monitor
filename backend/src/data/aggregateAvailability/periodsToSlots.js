const moment = require('moment-timezone');

const { generateSlots } = require('./utils');

/* function unavailabilityToSlots(unavailability) {
  const { updates } = unavailability;

  if (
    unavailability.availablePower_MW !==
    updates[updates.length - 1].availablePower_MW
  ) {
    updates.push(unavailability);
  }

  const res = updates.map((update, i) => ({
    startDate: i === 0 ? unavailability.startDate : update.updatedAt,
    endDate:
      i === updates.length - 1
        ? unavailability.endDate
        : updates[i + 1].updatedAt,
  }));
} */

function periodWithProdToSlots(period, prodData) {
  const slots = generateSlots(period.startDate, period.endDate, 0);

  const filledSlots = slots.map(slot => {
    const year = moment(slot.startDate).year();
    const item =
      prodData[year][period.eicCode][
        moment(slot.startDate)
          .startOf('hour')
          .toISOString()
      ];

    /* if (!item) {
      console.log(slot.startDate);
      item = Object.values(prodData[year][period.eicCode]).find(s =>
        moment(s.startDate).isAfter(slot.startDate),
      );
    } */

    return {
      ...slot,
      value: item ? Math.max(item.value, 0) : null,
    };
  });

  return {
    startDate: period.startDate,
    endDate: period.endDate,
    eicCode: period.eicCode,
    slots: filledSlots,
  };
}

function periodToSlots(period, prodData) {
  const { startDate, endDate, eicCode, unavailabilities } = period;

  if (unavailabilities.length < 2 && unavailabilities[0].updates.length < 1) {
    const power = period.unavailabilities[0].availablePower_MW || 0;
    return {
      startDate,
      endDate,
      eicCode,
      slots: generateSlots(startDate, endDate, power),
    };
  }

  return periodWithProdToSlots(period, prodData);
}

module.exports = periodToSlots;
