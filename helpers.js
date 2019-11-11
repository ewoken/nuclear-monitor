function normalizePort(port) {
  const normalizedPort = Number(port);
  if (Number.isNaN(port)) {
    throw new Error('Bad port for server');
  }
  return normalizedPort;
}

function readCSV(string) {
  const lines = string.split('\n').map(l => l.split(','));
  lines.pop();
  const headers = lines.shift();

  return lines.map(line => {
    return line.reduce(
      (object, cell, i) =>
        Object.assign(object, {
          [headers[i]]: cell,
        }),
      {},
    );
  });
}

function setTimeoutPromise(f, ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      f()
        .then(resolve)
        .catch(reject);
    }, ms);
  });
}

function retryWrapper(f, { retryInterval, retryCount, name = '' }) {
  let index = 0;
  return function retryWrapped(...args) {
    if (index > 0) {
      console.log(`Retry ${name}`);
    }

    return f(...args).catch(err => {
      if (index >= retryCount) {
        throw err;
      }

      return setTimeoutPromise(() => {
        index += 1;
        return retryWrapped(...args);
      }, retryInterval);
    });
  };
}

module.exports = {
  normalizePort,
  readCSV,
  setTimeoutPromise,
  retryWrapper,
};
