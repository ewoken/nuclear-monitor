import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { compose, withProps } from 'recompose';

import ga from 'react-ga';

const f = title => (...args) => console.log(title, ...args);
const mockGa = {
  set: () => {},
  pageview: f('tracker.pageview'),
};

const isDev = process.env.NODE_ENV !== 'production';
const tracker = isDev ? mockGa : ga;

if (!isDev) ga.initialize('UA-153111142-1', { siteSpeedSampleRate: 100 });

class AnalyticsComponent extends Component {
  componentDidMount() {
    this.trackPage();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.trackPage();
    }
  }

  trackPage() {
    const { location } = this.props;
    tracker.set({ location });
    tracker.pageview(location);
  }

  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}

AnalyticsComponent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
  location: PropTypes.string.isRequired,
};

export default compose(
  withRouter,
  withProps(props => ({
    location: `${props.location.pathname}${props.location.search}`,
  })),
)(AnalyticsComponent);
