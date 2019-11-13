const fetch = require('node-fetch');
const config = require('config');

const { fetchToken } = require('./rteApi');

async function updateRteToken(environment) {
  const { logger } = environment;

  logger.info('Renew token');
  const newToken = await fetchToken().catch(err => {
    logger.error('Error in renewing token', err);
  });

  // eslint-disable-next-line no-param-reassign
  environment.rteToken = newToken;
}

const HOST = config.get('server.host');
const PORT = config.get('server.port');
async function keepAlive() {
  await fetch(`${HOST}:${PORT}/_status`);
}

const UPDATE_INTERVAL = 10 * 60 * 1000; // 10 min

function initJobs(environment) {
  const updateTokenId = setInterval(
    () => updateRteToken(environment),
    UPDATE_INTERVAL,
  );

  const keepAliveId = setInterval(() => keepAlive(), 30 * 1000);

  const jobIds = [updateTokenId, keepAliveId];

  // eslint-disable-next-line no-param-reassign
  environment.jobIds = jobIds;
}

function killJobs({ jobIds }) {
  jobIds.forEach(jobId => clearInterval(jobId));
}

module.exports = { initJobs, killJobs };
