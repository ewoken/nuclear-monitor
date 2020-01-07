const fetch = require('node-fetch');
const qs = require('qs');
const config = require('config');

const { retryWrapper } = require('./utils/helpers');
const { DefaultError } = require('./utils/errors');

const RTE_API_KEY = config.get('RTE_API_KEY');
const RTE_HOST = 'https://digital.iservices.rte-france.com';

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';

class RTEServiceError extends DefaultError {
  constructor(message, payload) {
    super(message, RTEServiceError.ERROR_CODE, payload);
  }

  static get ERROR_CODE() {
    return 'RTE_SERVICE_ERROR';
  }
}

const retryFetch = retryWrapper(fetch, {
  retryInterval: 1000,
  retryCount: 3,
  name: 'fetch',
});

async function fetchToken() {
  const res = await retryFetch(`${RTE_HOST}/token/oauth/`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${RTE_API_KEY}`,
    },
  });
  const data = await res.json();

  return data.access_token;
}

async function getRessourceFn({ ressource, params = {}, token }) {
  const url = `${RTE_HOST}/open_api/${ressource}?${qs.stringify(params)}`;
  const res = await retryFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const payload = {
      code: res.status,
      body: await res.text(),
    };
    throw new RTEServiceError('RTE Error', payload);
  }

  const data = await res.json();
  return data;
}

const getRessource = retryWrapper(getRessourceFn, {
  retryCount: 3,
  retryInterval: 1000,
  name: 'rte.getRessource',
});

module.exports = {
  fetchToken,
  getRessource,
  DATE_FORMAT,
  RTEServiceError,
};
