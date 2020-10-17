import PropTypes from 'prop-types';

export const ProductionType = PropTypes.shape({
  // startDate: PropTypes.string.isRequired,
  // endDate: PropTypes.string.isRequired,
  // updatedDate: PropTypes.string.isRequired,
  value: PropTypes.number,
});

export const UnavailabilityType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  eicCode: PropTypes.string.isRequired,
  reason: PropTypes.string.isRequired,
  status: PropTypes.string,
  availablePower_MW: PropTypes.number.isRequired,
  updates: PropTypes.arrayOf(PropTypes.object).isRequired,
});

export const PlantType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  coords: PropTypes.arrayOf(PropTypes.number).isRequired,
  coolingType: PropTypes.string.isRequired,
  coolingPlace: PropTypes.string.isRequired,
  wikiLink: PropTypes.string.isRequired,
  asnLink: PropTypes.string.isRequired,
  edfLink: PropTypes.string.isRequired,
  pictures: PropTypes.arrayOf(PropTypes.string).isRequired,
});

export const ReactorType = PropTypes.shape({
  eicCode: PropTypes.string.isRequired,
  plantId: PropTypes.string.isRequired,
  reactorIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  stage: PropTypes.string.isRequired,
  thermalPower_MW: PropTypes.number.isRequired,
  rawPower_MW: PropTypes.number.isRequired,
  netPower_MW: PropTypes.number.isRequired,
  buildStartDate: PropTypes.string.isRequired,
  firstReactionDate: PropTypes.string.isRequired,
  gridLinkDate: PropTypes.string.isRequired,
  exploitationStartDate: PropTypes.string.isRequired,
  moxAuthorizationDate: PropTypes.string.isRequired,
  coolingTowerCount: PropTypes.number.isRequired,
  dayProductions: PropTypes.arrayOf(ProductionType).isRequired,
  unavailabilities: PropTypes.arrayOf(UnavailabilityType).isRequired,
});

export const MixType = PropTypes.shape({
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
