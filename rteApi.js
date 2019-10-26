const fetch = require('node-fetch');
const qs = require('qs');
const config = require('config');

const RTE_API_KEY = config.get('RTE_API_KEY');
const RTE_HOST = 'https://digital.iservices.rte-france.com';

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';

async function fetchToken() {
  const res = await fetch(`${RTE_HOST}/token/oauth/`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${RTE_API_KEY}`,
    },
  });
  const data = await res.json();

  return data.access_token;
}

async function getRessource({ ressource, params = {}, token }) {
  const url = `${RTE_HOST}/open_api/${ressource}?${qs.stringify(params)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    return { code: res.status, body };
  }

  const data = await res.json();
  return data;
}

module.exports = {
  fetchToken,
  getRessource,
  DATE_FORMAT,
};
