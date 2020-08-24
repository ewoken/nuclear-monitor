const updateRteTokenJob = require('./updateRteToken');
const keepAliveJob = require('./keepAlive');
const updateUnavailabilitiesJob = require('./updateUnavailavilities');
const updateHistoricFlows = require('./updateHistoricFlows');
// const updateDailyFlows = require('./updateDailyFlows');

const jobs = [
  updateRteTokenJob,
  keepAliveJob,
  updateUnavailabilitiesJob,
  updateHistoricFlows,
];

function initJobs(environment) {
  const jobIds = jobs.map(job => {
    return setInterval(() => job.f(environment), job.interval);
  });

  // updateUnavailabilitiesJob.f(environment);
  // updateHistoricFlows
  //   .f(environment)
  //   .then(() => updateDailyFlows.f(environment));

  // eslint-disable-next-line no-param-reassign
  environment.jobIds = jobIds;
}

function killJobs({ jobIds }) {
  jobIds.forEach(jobId => clearInterval(jobId));
}

module.exports = { initJobs, killJobs };
