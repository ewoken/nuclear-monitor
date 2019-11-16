const Joi = require('joi');
const moment = require('moment-timezone');

const DateInput = Joi.object({
  date: Joi.date().default(() => moment().toISOString(), 'now'),
});

module.exports = {
  DateInput,
};
