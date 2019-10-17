import React from 'react';
import PropTypes from 'prop-types';

import { Map, TileLayer, Marker, ZoomControl } from 'react-leaflet';

import Leaflet from 'leaflet';

import {
  testScreenType,
  getWindowHeight,
  HEADER_HEIGHT,
  DRAWER_WIDTH,
} from '../utils';
import { PlantType } from '../utils/types';

const NORMAL_ICON = new Leaflet.DivIcon.SVGIcon({
  fillOpacity: 1,
  iconSize: [24, 38],
});
const SELECTED_ICON = new Leaflet.DivIcon.SVGIcon({
  color: 'red',
  fillOpacity: 1,
  iconSize: [24, 38],
});

function PlantMap(props) {
  const { plants, currentPlantId, onPlantClick, drawerHeight } = props;
  const isSmallScreen = !testScreenType('sm');
  const height = getWindowHeight();
  return (
    <Map
      center={[48.3, 2]}
      zoom={isSmallScreen ? 5 : 6}
      style={{
        height: isSmallScreen ? height - HEADER_HEIGHT - drawerHeight : height,
        marginTop: isSmallScreen ? HEADER_HEIGHT + drawerHeight : 0, // TODO
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
          icon={plant.id === currentPlantId ? SELECTED_ICON : NORMAL_ICON}
          onClick={() => onPlantClick(plant)}
        />
      ))}
    </Map>
  );
}

PlantMap.propTypes = {
  plants: PropTypes.arrayOf(PlantType).isRequired,
  currentPlantId: PropTypes.string.isRequired,
  onPlantClick: PropTypes.func.isRequired,
  drawerHeight: PropTypes.number.isRequired,
};

export default PlantMap;
