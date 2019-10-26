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

const { getProductions, getUnavailabilities } = require('./services');

function serviceWrapper(service, environment) {
  return async function wrappedService(req, res, next) {
    try {
      const data = await service(environment);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}

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

  app.get('/productions', serviceWrapper(getProductions, environment));
  app.get(
    '/unavailabilities',
    serviceWrapper(getUnavailabilities, environment),
  );

  app.use(notFoundMiddleware());
  app.use(errorHandlerMiddleware(logger));

  return app;
}

module.exports = {
  buildApi,
};
