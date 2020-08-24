const fs = require('fs');
const path = require('path');
const { readCSV } = require('../utils/helpers');
const { getStationInfo } = require('../vigicrueApi');

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
  hydroPositionCode: plantData.hydroPositionCode || null,
  hasHydroHistoric: plantData.hasHydroHistoric === '1',
}));

let plantData = null;
async function getPlants() {
  if (plantData) {
    return Promise.resolve(plantData);
  }

  return Promise.all(
    plants.map(plant => {
      if (!plant.hydroPositionCode) {
        return Promise.resolve({
          ...plant,
          oldHydroPositionCode: null,
          hydroRegionCode: null,
          hydroPositionName: null,
        });
      }

      return getStationInfo(plant.hydroPositionCode).then(stationData => {
        return Promise.resolve({
          ...plant,
          oldHydroPositionCode: stationData.CdStationHydroAncienRef,
          hydroRegionCode:
            stationData.VigilanceCrues.PereBoitEntVigiCru.CdEntVigiCru,
          hydroPositionName: stationData.LbStationHydro,
        });
      });
    }),
  ).then(data => {
    plantData = data;
    return data;
  });
}

const reactors = readCSV(
  fs.readFileSync(path.join(__dirname, './reactors.csv'), 'utf8'),
).map(reactorData => ({
  ...reactorData,
  reactorIndex: Number(reactorData.reactorIndex),
  thermalPower_MW: Number(reactorData.thermalPower_MW),
  rawPower_MW: Number(reactorData.rawPower_MW),
  netPower_MW: Number(reactorData.netPower_MW),
  coolingTowerCount: Number(reactorData.coolingTowerCount),
  moxAuthorizationDate: reactorData.moxAuthorizationDate || null,
}));

module.exports = {
  getPlants,
  reactors,
};
