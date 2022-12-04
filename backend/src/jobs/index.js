const updateRteTokenJob = require('./updateRteToken');
const updateUnavailabilitiesJob = require('./updateUnavailavilities');
const keepAliveJob = require('./keepAlive');

const jobs = [updateRteTokenJob, updateUnavailabilitiesJob, keepAliveJob];

function initJobs(environment) {
  const jobIds = jobs.map(job => {
    return setInterval(() => job.f(environment), job.interval);
  });

  updateUnavailabilitiesJob.f(environment);

  // eslint-disable-next-line no-param-reassign
  environment.jobIds = jobIds;
}

function killJobs({ jobIds }) {
  jobIds.forEach(jobId => clearInterval(jobId));
}

module.exports = { initJobs, killJobs };
