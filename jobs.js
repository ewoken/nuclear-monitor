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

const UPDATE_INTERVAL = 10 * 60 * 1000; // 10 min

function initJobs(environment) {
  const updateTokenId = setInterval(
    () => updateRteToken(environment),
    UPDATE_INTERVAL,
  );

  const jobIds = [updateTokenId];

  // eslint-disable-next-line no-param-reassign
  environment.jobIds = jobIds;
}

function killJobs({ jobIds }) {
  jobIds.forEach(jobId => clearInterval(jobId));
}

module.exports = { initJobs, killJobs };
