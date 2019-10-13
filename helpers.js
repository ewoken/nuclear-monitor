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

module.exports = {
  normalizePort,
  readCSV,
};
