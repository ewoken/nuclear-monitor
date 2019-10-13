const config = require('config');
const express = require('express');

// middlewares
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// const moment = require('moment-timezone');

const PLANTS = require('./data/plants.json');
const REACTORS = require('./data/reactors.json');

const {
  errorHandlerMiddleware,
  logRequestMiddleware,
  addRequestIdMiddleware,
  notFoundMiddleware,
} = require('./middlewares');

const { getRessource } = require('./rteApi'); // DATE_FORMAT

function buildApi({ logger, rteToken }) {
  const app = express();

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

  let cache = null;
  app.get('/productions', async (req, res) => {
    if (cache) {
      logger.info('cache');
      res.json(cache);
      return;
    }

    const data = await getRessource({
      ressource: 'actual_generation/v1/actual_generations_per_unit',
      // params: {
      //   start_date: moment()
      //     .startOf('day')
      //     .tz('Europe/Paris')
      //     .format(DATE_FORMAT),
      //   end_date: moment()
      //     .startOf('hour')
      //     .tz('Europe/Paris')
      //     .format(DATE_FORMAT),
      // },
      token: rteToken,
    });
    const nuclearPlant = data.actual_generations_per_unit
      .filter(d => d.unit.production_type === 'NUCLEAR')
      .map(reactor => ({
        eicCode: reactor.unit.eic_code,
        values: reactor.values,
      }));

    cache = nuclearPlant;
    res.json(nuclearPlant);
  });

  app.use(notFoundMiddleware());
  app.use(errorHandlerMiddleware(logger));

  return app;
}

module.exports = {
  buildApi,
};
