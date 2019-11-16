const uuid = require('uuid');
const onFinished = require('on-finished');
const onHeaders = require('on-headers');
const { omit } = require('ramda');

const { DomainError, ValidationError } = require('./errors');

function addRequestIdMiddleware() {
  return function addRequestId(req, res, next) {
    req.requestId = uuid();
    next();
  };
}

function errorHandlerMiddleware(logger) {
  const BAD_JSON = 'BAD_JSON';
  return function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      res.statusCode = 400;
      res.json({
        error: {
          message: err.message,
          errorCode: BAD_JSON,
          payload: null,
        },
      });
    } else if (err instanceof DomainError || err instanceof ValidationError) {
      res.statusCode = 400;
      res.json({ error: err.toObject() });
    } else {
      logger.error(err.stack, { requestId: req.requestId });
      res.statusCode = 500;
      res.json({ error: `${req.requestId}` });
    }

    return next();
  };
}

function logRequestMiddleware(logger) {
  return function logRequest(req, res, next) {
    const startTime = Date.now();
    let responseTime;
    onHeaders(res, () => {
      responseTime = Date.now() - startTime;
    });
    onFinished(res, () => {
      const message = `${res.statusCode} ${req.method} ${req.originalUrl}`;
      const data = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        headers: omit(['cookie', 'authorization'], req.headers),
        responseTime,
      };
      if (res.statusCode === 500) {
        logger.error(message, data);
      } else {
        logger.info(message, data);
      }
    });
    next();
  };
}

function notFoundMiddleware() {
  return function notFound(req, res) {
    if (!res.headersSent) {
      res.status(404).json({
        error: `${req.method} ${req.originalUrl}: Not found`,
      });
    }
  };
}

module.exports = {
  addRequestIdMiddleware,
  errorHandlerMiddleware,
  logRequestMiddleware,
  notFoundMiddleware,
};
