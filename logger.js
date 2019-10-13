const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [],
});

const { NODE_ENV, DEBUG } = process.env;
function getLevel() {
  if (DEBUG === 'true') {
    return 'debug';
  }
  return NODE_ENV === 'test' ? 'warn' : 'info';
}

if (NODE_ENV === 'production') {
  logger.add(new winston.transports.Console());
} else {
  logger.add(
    new winston.transports.Console({
      level: getLevel(),
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp(),
      ),
    }),
  );
}

module.exports = logger;
