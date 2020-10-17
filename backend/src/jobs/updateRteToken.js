const { fetchToken } = require('../rteApi');

async function updateRteToken(environment) {
  const { logger } = environment;

  logger.info('Renew token');
  const newToken = await fetchToken().catch(err => {
    logger.error('Error in renewing token', err);
  });

  // eslint-disable-next-line no-param-reassign
  environment.rteToken = newToken;
}

module.exports = {
  f: updateRteToken,
  interval: 10 * 60 * 1000, // 10 min
};
