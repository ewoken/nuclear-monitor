const isoFetch = require('isomorphic-fetch');
const fetchWithCookieBuilder = require('fetch-cookie');
const { CookieJar } = require('tough-cookie');
const FormData = require('form-data');
const { parse: parseHTML } = require('node-html-parser');
const moment = require('moment-timezone');
const { indexBy, sortBy } = require('ramda');

const { retryWrapper } = require('./utils/helpers');

const fetchWithCookie = fetchWithCookieBuilder(isoFetch, new CookieJar());
const retryFetch = retryWrapper(fetchWithCookie, {
  retryInterval: 1000,
  retryCount: 3,
  name: 'fetch',
});

const HYDRO_URL = 'http://www.hydro.eaufrance.fr';

async function addPosition(positionCode) {
  const form = new FormData();

  form.append('cmd', 'filtrer');
  form.append('consulte', 'rechercher');
  form.append('code_station', positionCode);
  form.append('cours_d_eau', '');
  form.append('commune', '');
  form.append('departement', '');
  form.append('bassin_hydrographique', '');
  form.append('station_en_service', 1);
  form.append('station_hydrologique', 1);
  form.append('station[]', positionCode);
  form.append('btnValider', 'Visualiser');

  const res = await retryFetch(`${HYDRO_URL}/selection.php`, {
    method: 'POST',
    body: form,
  });

  return res.text();
}

async function initPosition(positionCode) {
  const form = new FormData();
  form.append('categorie', 'rechercher');
  form.append('station[]', positionCode);
  form.append('procedure', 'QJM');

  const res = await retryFetch(`${HYDRO_URL}/presentation/procedure.php`, {
    method: 'POST',
    body: form,
  });

  return res.text();
}

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];
async function getFlows(positionCode, startYear, endYear) {
  await addPosition(positionCode);
  await initPosition(positionCode);

  const form = new FormData();
  form.append('procedure', 'qjm');
  form.append('debut_an', startYear);
  form.append('fin_an', endYear);
  form.append('btnValider', 'Valider');

  const res = await retryFetch(`${HYDRO_URL}/presentation/procedure.php`, {
    method: 'POST',
    body: form,
  });
  const html = await res.text();
  const document = parseHTML(html);
  const monthDivs = [...document.querySelectorAll('h3')]
    .filter(e => !e.innerHTML.toString().includes('Débits'))
    .map(e => {
      const [month, year] = e.innerHTML.toString().split(' ');
      const monthIndex = MONTHS.indexOf(month.trim());
      if (monthIndex < 0) throw new Error(`bad name month: ${month}`);

      return {
        year: Number(year),
        month: monthIndex,
        div: e.parentNode,
      };
    });

  const yearStart = moment()
    .year(startYear)
    .startOf('year');
  const days = moment()
    .year(endYear)
    .endOf('year')
    .diff(yearStart, 'days');
  const allDates = Array.from({ length: days }).map((_, i) => {
    const d = moment(yearStart).add(i, 'days');
    return {
      date: d.format('YYYY-MM-DD'),
      value: null,
    };
  });
  const index = indexBy(v => v.date, allDates);

  monthDivs.forEach(monthDiv => {
    const { year, month, div } = monthDiv;
    const firstTable = div.querySelector('table');
    const tds = firstTable
      .querySelectorAll('td')
      .filter(e2 => e2.getAttribute('headers') === 'C1');

    return tds.forEach((td, i) => {
      const s = td.innerHTML.toString();
      const value = s.length > 0 ? Number(s) : null;
      const key = moment()
        .year(year)
        .month(month)
        .date(i + 1)
        .format('YYYY-MM-DD');

      index[key] = {
        date: key,
        value,
      };
    });
  });

  return sortBy(d => d.date, Object.values(index));
}

async function main() {
  getFlows('K408001001', 2012, 2020);
}

if (require.main === module) {
  main();
}

module.exports = {
  getFlows,
};
