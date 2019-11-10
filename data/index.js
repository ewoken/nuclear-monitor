const fs = require('fs');
const { readCSV } = require('../helpers');

const plantPictures = readCSV(
  fs.readFileSync('./data/plantPictures.csv', 'utf8'),
);

const plants = readCSV(fs.readFileSync('./data/plants.csv', 'utf8')).map(
  plantData => ({
    id: plantData.id,
    name: plantData.name,
    coords: [Number(plantData.lat), Number(plantData.long)],
    coolingType: plantData.coolingType,
    coolingPlace: plantData.coolingPlace,
    hasCoolingTower: plantData.hasCoolingTower === 'TRUE',
    wikiLink: plantData.wikiLink,
    asnLink: plantData.asnLink,
    pictures: plantPictures
      .filter(p => p.plantId === plantData.id)
      .map(p => p.url),
  }),
);

const reactors = readCSV(fs.readFileSync('./data/reactors.csv', 'utf8')).map(
  reactorData =>
    Object.assign(reactorData, {
      reactorIndex: Number(reactorData.reactorIndex),
      power_MW: Number(reactorData.power_MW),
      buildStartYear: Number(reactorData.buildStartYear),
      gridLinkYear: Number(reactorData.gridLinkYear),
      exploitationStartYear: Number(reactorData.exploitationStartYear),
    }),
);

module.exports = {
  plants,
  reactors,
};
