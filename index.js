const enableDestroy = require('server-destroy');
const config = require('config');

const logger = require('./logger');
const { normalizePort } = require('./helpers');
const { buildApi } = require('./api');
const { fetchToken } = require('./rteApi');

async function launchApp() {
  const rteToken = await fetchToken();

  const environment = {
    logger,
    rteToken,
  };
  const app = buildApi(environment);

  const port = normalizePort(config.get('server.port'));
  const server = app.listen(port, () => {
    logger.info('Server is listening on', { port });
  });
  enableDestroy(server);

  server.on('close', () => {
    logger.info('Server closed');
  });

  process.on('SIGINT', () => server.close());
  process.on('SIGTERM', () => server.close());
  process.on('unhandledRejection', (reason, p) => {
    logger.error(`Unhandled Rejection at: ${p} reason: ${reason}`);
    server.close();
    process.exit(1);
  });

  return server;
}

if (require.main === module) {
  launchApp();
}

module.exports = launchApp;
