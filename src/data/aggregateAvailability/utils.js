const fs = require('fs');

const moment = require('moment-timezone');

function toCSV(array, keys) {
  const headers = keys.join(',');
  const lines = array.map(value => {
    return keys.map(key => value[key]).join(',');
  });
  const content = [headers, ...lines, '\n'];
  return content.join('\n');
}

function debugJSON(path, obj) {
  fs.writeFileSync(path, JSON.stringify(obj, null, 2));
}

function floorHalfHour(date) {
  const d = moment(date);
  const minutes = d.minutes();

  if (
    moment(d)
      .startOf('hour')
      .add(30, 'minutes')
      .isSame(d)
  ) {
    return d;
  }

  return minutes < 30
    ? d.startOf('hour')
    : d.startOf('hour').add(30, 'minutes');
}

function ceilHalfHour(date) {
  const d = moment(date);
  const minutes = d.minutes();

  if (
    moment(d)
      .startOf('hour')
      .isSame(d)
  ) {
    return d;
  }

  return minutes >= 30
    ? d.add(1, 'hour').startOf('hour')
    : d.startOf('hour').add(30, 'minutes');
}

function generateSlots(startDate, endDate, value) {
  const n = Math.ceil(moment(endDate).diff(startDate, 'minutes') / 30);

  return Array.from({ length: n }).map((_, i) => ({
    startDate: moment(startDate)
      .add(i * 30, 'minutes')
      .toISOString(),
    endDate: moment(startDate)
      .add((i + 1) * 30, 'minutes')
      .toISOString(),
    value,
  }));
}

module.exports = {
  toCSV,
  debugJSON,
  floorHalfHour,
  ceilHalfHour,
  generateSlots,
};
