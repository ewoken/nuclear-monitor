const config = require('config');
const express = require('express');

// middlewares
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const { plants: PLANTS, reactors: REACTORS } = require('./data');

const {
  errorHandlerMiddleware,
  logRequestMiddleware,
  addRequestIdMiddleware,
  notFoundMiddleware,
} = require('./middlewares');

const { getProductions } = require('./services');

function buildApi(environment) {
  const app = express();
  const { logger } = environment;

  app.use(addRequestIdMiddleware());
  app.use(logRequestMiddleware(logger));
  app.use(helmet());
  app.use(compression());
  app.use(cors(config.get('api.cors')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/plants', (req, res) => {
    res.json(PLANTS);
  });

  app.get('/reactors', (req, res) => {
    res.json(REACTORS);
  });

  app.get('/productions', async (req, res) => {
    const productions = await getProductions(environment);
    res.json(productions);
  });

  // app.get('/mix', async (req, res) => {
  //   const mix = await getMix();
  //   res.json(mix);
  // });

  app.use(notFoundMiddleware());
  app.use(errorHandlerMiddleware(logger));

  return app;
}

module.exports = {
  buildApi,
};
