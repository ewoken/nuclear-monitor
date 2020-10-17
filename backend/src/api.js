const config = require('config');
const express = require('express');

// middlewares
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const { getPlants, reactors: REACTORS } = require('./data');
const { RTEServiceError } = require('./rteApi');

const {
  errorHandlerMiddleware,
  logRequestMiddleware,
  addRequestIdMiddleware,
  notFoundMiddleware,
} = require('./utils/middlewares');

const {
  getProductions,
  getUnavailabilities,
  getNextUnavailabilities,
  getFinishedUnavailabilities,
  getMix,
  getRiverFlows,
} = require('./services');

function serviceWrapper(service, environment) {
  return async function wrappedService(req, res, next) {
    try {
      const data = await service(req.query, environment);
      res.json(data);
    } catch (err) {
      if (err instanceof RTEServiceError) {
        res.statusCode = 500;
        res.json(err.toObject());
        return;
      }

      next(err);
    }
  };
}

async function buildApi(environment) {
  const app = express();
  const { logger } = environment;

  app.use(addRequestIdMiddleware());
  app.use(logRequestMiddleware(logger));
  app.use(helmet());
  app.use(compression());
  app.use(cors(config.get('api.cors')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const plants = await getPlants();
  app.get('/plants', (req, res) => {
    res.json(plants);
  });

  app.get('/reactors', (req, res) => {
    res.json(REACTORS);
  });

  app.get('/productions', serviceWrapper(getProductions, environment));
  app.get(
    '/unavailabilities',
    serviceWrapper(getUnavailabilities, environment),
  );
  app.get(
    '/unavailabilities/finished',
    serviceWrapper(getFinishedUnavailabilities, environment),
  );
  app.get(
    '/unavailabilities/next',
    serviceWrapper(getNextUnavailabilities, environment),
  );
  app.get('/mix', serviceWrapper(getMix, environment));
  app.get('/flows', serviceWrapper(getRiverFlows, environment));

  if (process.env.NODE_ENV !== 'production') {
    app.get('/token', (req, res) => {
      res.json({ token: environment.rteToken });
    });
  }

  app.get('/_status', (req, res) => {
    res.json({ status: 'OK' });
  });

  app.use(notFoundMiddleware());
  app.use(errorHandlerMiddleware(logger));

  return app;
}

module.exports = {
  buildApi,
};
