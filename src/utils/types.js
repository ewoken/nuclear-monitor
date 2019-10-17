import PropTypes from 'prop-types';

export const PlantType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  coords: PropTypes.arrayOf(PropTypes.number).isRequired,
  coolingType: PropTypes.string.isRequired,
  coolingPlace: PropTypes.string.isRequired,
  hasCoolingTower: PropTypes.bool.isRequired,
  wikiLink: PropTypes.string.isRequired,
  asnLink: PropTypes.string.isRequired,
});

export const ReactorType = PropTypes.shape({
  eicCode: PropTypes.string.isRequired,
  plantId: PropTypes.string.isRequired,
  reactorIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  stage: PropTypes.string.isRequired,
  power_MW: PropTypes.number.isRequired,
  buildStartYear: PropTypes.number.isRequired,
  gridLinkYear: PropTypes.number.isRequired,
  exploitationStartYear: PropTypes.number.isRequired,
  actualProd: PropTypes.number.isRequired, // TODO
});

export const MixType = PropTypes.shape({
  isOk: PropTypes.bool.isRequired,
  datetime: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
  solar: PropTypes.number.isRequired,
  nuclear: PropTypes.number.isRequired,
  gas: PropTypes.number.isRequired,
  oil: PropTypes.number.isRequired,
  coal: PropTypes.number.isRequired,
  consumption: PropTypes.number.isRequired,
  biomass: PropTypes.number.isRequired,
  hydroPumped: PropTypes.number.isRequired,
  hydro: PropTypes.number.isRequired,
  imports: PropTypes.number.isRequired,
  exports: PropTypes.number.isRequired,
});
