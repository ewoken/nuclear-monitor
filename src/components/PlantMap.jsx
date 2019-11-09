import React from 'react';
import PropTypes from 'prop-types';

import { Map, TileLayer, Marker, ZoomControl, GeoJSON } from 'react-leaflet';

import Leaflet from 'leaflet';

import {
  testScreenType,
  getWindowHeight,
  HEADER_HEIGHT,
  DRAWER_WIDTH,
} from '../utils';
import { PlantType } from '../utils/types';

const ICON_OPTIONS = {
  fillOpacity: 1,
  iconSize: [24, 38],
  circleColor: 'white',
  circleRatio: 0.6,
  circleWeight: 3,
};

function hasNotif(plant) {
  return plant.reactors.reduce((res, reactor) => {
    if (reactor.status !== 'RUNNING' && reactor.status !== 'PLANNED_STOP') {
      return true;
    }
    return res;
  }, false);
}

function plantRatio(plant) {
  const totalProd = plant.reactors.reduce((res, reactor) => {
    const prod =
      reactor.dayProductions.length > 0
        ? Math.max(
            reactor.dayProductions[reactor.dayProductions.length - 1].value,
            0,
          )
        : 0;

    return res + prod;
  }, 0);
  const totalPower = plant.reactors.reduce((res, r) => res + r.power_MW, 0);

  return totalProd / totalPower;
}

function PlantMap(props) {
  const { plants, currentPlantId, onPlantClick, drawerHeight, rivers } = props;
  const isSmallScreen = !testScreenType('sm');
  const height = getWindowHeight();
  return (
    <Map
      center={[48.3, 2]}
      zoom={isSmallScreen ? 5 : 6}
      style={{
        height: isSmallScreen
          ? height - HEADER_HEIGHT - drawerHeight
          : height - HEADER_HEIGHT,
        marginTop: isSmallScreen ? HEADER_HEIGHT + drawerHeight : HEADER_HEIGHT, // TODO
        marginLeft: isSmallScreen ? 0 : DRAWER_WIDTH,
      }}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {plants.map(plant => (
        <Marker
          key={plant.id}
          title={plant.name}
          position={plant.coords}
          icon={
            plant.id === currentPlantId
              ? new Leaflet.DivIcon.SVGIcon.IndicatorIcon({
                  ...ICON_OPTIONS,
                  color: 'red',
                  loadRate: plantRatio(plant),
                  notif: hasNotif(plant),
                })
              : new Leaflet.DivIcon.SVGIcon.IndicatorIcon({
                  ...ICON_OPTIONS,
                  loadRate: plantRatio(plant),
                  notif: hasNotif(plant),
                })
          }
          onClick={() => onPlantClick(plant)}
        />
      ))}
      {rivers.map(river => (
        <GeoJSON data={river} />
      ))}
    </Map>
  );
}

PlantMap.propTypes = {
  plants: PropTypes.arrayOf(PlantType).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  rivers: PropTypes.array.isRequired,
  currentPlantId: PropTypes.string,
  onPlantClick: PropTypes.func.isRequired,
  drawerHeight: PropTypes.number.isRequired,
};

PlantMap.defaultProps = {
  currentPlantId: null,
};

export default PlantMap;
