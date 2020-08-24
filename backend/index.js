const enableDestroy = require('server-destroy');
const config = require('config');
const { MongoClient } = require('mongodb');

const logger = require('./src/utils/logger');
const MemoryCache = require('./src/utils/MemoryCache');

const { normalizePort } = require('./src/utils/helpers');
const { buildApi } = require('./src/api');
const { fetchToken } = require('./src/rteApi');
const { initJobs, killJobs } = require('./src/jobs');

const uri = config.get('mongoDb.uri');
const dbName = config.get('mongoDb.dbName');

async function launchApp() {
  const rteToken = await fetchToken();
  const mongoClient = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  const environment = {
    logger,
    rteToken,
    cache: new MemoryCache(logger),
    db: mongoClient.db(dbName),
  };

  initJobs(environment);
  const app = await buildApi(environment);

  const port = normalizePort(config.get('server.port'));
  const server = app.listen(port, () => {
    logger.info('Server is listening on', { port });
  });
  enableDestroy(server);

  server.on('close', () => {
    mongoClient.close();
    killJobs(environment);
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
