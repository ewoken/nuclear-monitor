import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const PlantType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  coords: PropTypes.arrayOf(PropTypes.number).isRequired,
  reactors: PropTypes.arrayOf(PropTypes.string).isRequired,
});
