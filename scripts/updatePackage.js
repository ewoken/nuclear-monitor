const fs = require('fs');
const thePackage = require('../package.json');

const newPackage = {
  ...thePackage,
  homepage: process.env.APP_HOMEPAGE || 'https://nuclear-monitor.fr',
};

console.log('Update package.json');
fs.writeFileSync('package.json', JSON.stringify(newPackage, false, 2));
