import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { omit, equals } from 'ramda';

class Loader extends Component {
  componentDidMount() {
    const { load, ...otherProps } = this.props;

    load(otherProps);
  }

  componentDidUpdate(prevProps) {
    const prevOtherProps = omit(['load'], prevProps);
    const { load, ...otherProps } = this.props;

    if (!equals(prevOtherProps, otherProps)) {
      load(otherProps);
    }
  }

  render() {
    return null;
  }
}

Loader.propTypes = {
  load: PropTypes.func.isRequired,
};

function buildLoader(loadFunction) {
  return connect(
    null,
    { load: loadFunction },
  )(Loader);
}

export default buildLoader;
