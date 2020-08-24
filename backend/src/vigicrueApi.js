const fetch = require('isomorphic-fetch');
// const { parse: parseHTML } = require('node-html-parser');

const { retryWrapper } = require('./utils/helpers');

const retryFetch = retryWrapper(fetch, {
  retryInterval: 1000,
  retryCount: 3,
  name: 'fetch',
});

const VIGICRUE_URL = 'https://www.vigicrues.gouv.fr';

async function getLast30DaysFlow(positionCode) {
  const res = await retryFetch(
    `${VIGICRUE_URL}/services/observations.json/index.php?CdStationHydro=${positionCode}&GrdSerie=Q&FormatSortie=simple&FormatDate=iso`,
  );

  const data = await res.json();

  const flows = data.Serie.ObssHydro.map(item => ({
    date: item[0].substr(0, 10),
    value: item[1],
  }));
  const flowsByDay = flows.reduce((acc, item) => {
    const array = acc[item.date] || [];

    return {
      ...acc,
      [item.date]: [...array, item.value],
    };
  }, {});
  const meanFlowByDay = Object.keys(flowsByDay).map(date => ({
    date,
    value:
      Math.floor(
        (flowsByDay[date].reduce((s, v) => s + v, 0) /
          flowsByDay[date].length) *
          100,
      ) / 100,
  }));

  return meanFlowByDay;
}

// async function getHydroreel2(url) {
//   const res = await fetch(url);
//   const html = await res.text();
//   const document = await parseHTML(html);
//   const table = document.querySelector('#debit-jour');

//   const firstDate = table
//     .querySelectorAll('th')[1]
//     .innerHTML.toString()
//     .split('/')
//     .map(Number);
//   const values = [...table.querySelectorAll('td')]
//     .map(e => Number(e.innerHTML.toString()))
//     .slice(0, -1);
//   const startDate = moment()
//     .month(firstDate[1] - 1)
//     .date(firstDate[0]);
//   const flowsByDay = values.map((value, i) => ({
//     date: moment(startDate)
//       .add(i, 'days')
//       .format('YYYY-MM-DD'),
//     value,
//   }));

//   return flowsByDay;
// }

async function getStationInfo(positionCode) {
  const res = await retryFetch(
    `${VIGICRUE_URL}/services/station.json/index.php?CdStationHydro=${positionCode}`,
  );

  return res.json();
}

module.exports = {
  getStationInfo,
  getLast30DaysFlow,
};
