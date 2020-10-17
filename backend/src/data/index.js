const fs = require('fs');
const path = require('path');
const { readCSV } = require('../utils/helpers');

const plantPictures = readCSV(
  fs.readFileSync(path.join(__dirname, './plantPictures.csv'), 'utf8'),
);

const plants = readCSV(
  fs.readFileSync(path.join(__dirname, './plants.csv'), 'utf8'),
).map(plantData => ({
  id: plantData.id,
  name: plantData.name,
  coords: [Number(plantData.lat), Number(plantData.long)],
  coolingType: plantData.coolingType,
  coolingPlace: plantData.coolingPlace,
  hasCoolingTower: plantData.hasCoolingTower === 'TRUE',
  wikiLink: plantData.wikiLink,
  asnLink: plantData.asnLink,
  edfLink: plantData.edfLink,
  pictures: plantPictures
    .filter(p => p.plantId === plantData.id)
    .map(p => p.url),
}));

const reactors = readCSV(
  fs.readFileSync(path.join(__dirname, './reactors.csv'), 'utf8'),
).map(reactorData =>
  Object.assign(reactorData, {
    reactorIndex: Number(reactorData.reactorIndex),
    thermalPower_MW: Number(reactorData.thermalPower_MW),
    rawPower_MW: Number(reactorData.rawPower_MW),
    netPower_MW: Number(reactorData.netPower_MW),
    coolingTowerCount: Number(reactorData.coolingTowerCount),
    moxAuthorizationDate: reactorData.moxAuthorizationDate || null,
  }),
);

module.exports = {
  plants,
  reactors,
};
