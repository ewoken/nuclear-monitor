import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withState, compose } from 'recompose';
import qs from 'qs';

import { Row, Col, Icon } from 'antd';

import moment from 'moment-timezone';

import { format } from '../../utils/index';
import { MixType } from '../../utils/types';
import { mixSelector } from '../../store/mix';
import { reactorSetIndicatorsSelector } from '../../store/reactors';
import { getCurrentDate } from '../../store/otherSelectors';

import './index.css';
import MixComponent from './components/MixComponent';

function MixView(props) {
  const {
    mix,
    slotIndex,
    setSlotIndex,
    reactorSetIndicators,
    currentDate,
  } = props;
  const {
    totalPower,
    availablePower,
    availableCount,
    partiallyUnavailableCount,
    totallyUnavailableCount,
  } = reactorSetIndicators;

  const total = Math.floor(totalPower / 1000);
  const available = Math.floor(availablePower);
  const availabilityRate = Math.floor((100 * availablePower) / totalPower);
  const prodAvailableRate = Math.floor(
    (100 * mix[slotIndex].nuclear) / availablePower,
  );
  const availableSize = Math.max(
    ((availablePower - (mix[slotIndex].nuclear || 0)) / totalPower) * 100,
    0,
  );
  const date = moment(currentDate)
    .hour(Math.floor(slotIndex / 4))
    .minutes(15 * (slotIndex % 4))
    .format('DD/MM/YYYY HH:mm');

  return (
    <div className="MixView">
      <Row>
        <Col span={24}>
          <MixComponent
            mix={mix}
            slotIndex={slotIndex}
            setSlotIndex={setSlotIndex}
            currentDate={currentDate}
          />
          <div className="MixView__date">
            {moment(currentDate).isAfter('2012-01-02') ? (
              <Link
                to={location => ({
                  pathname: location.pathname,
                  search: qs.stringify({
                    date: moment(currentDate)
                      .subtract(1, 'day')
                      .startOf('hour')
                      .toISOString(),
                  }),
                })}
              >
                <Icon
                  theme="twoTone"
                  type="left-circle"
                  style={{ fontSize: '18pt' }}
                />
              </Link>
            ) : (
              <div />
            )}
            <div>{date}</div>
            {!moment().isSame(currentDate, 'day') ? (
              <Link
                to={location => ({
                  pathname: location.pathname,
                  search: qs.stringify({
                    date: moment(currentDate)
                      .add(1, 'day')
                      .startOf('hour')
                      .toISOString(),
                  }),
                })}
              >
                <Icon
                  theme="twoTone"
                  type="right-circle"
                  style={{ fontSize: '18pt' }}
                />
              </Link>
            ) : (
              <div />
            )}
          </div>
          <div className="MixView__nuclear">
            <strong>{`Parc nucléaire (${total} GW):`}</strong>
            <div className="MixView__nuclear__indicator">
              <div
                className="MixView__nuclear__indicator__prod"
                style={{
                  display: mix[slotIndex].nuclear ? 'inherit' : 'none',
                  width: `${((mix[slotIndex].nuclear || 0) / totalPower) *
                    100}%`,
                }}
              >
                <div>{`Prod: ${format(mix[slotIndex].nuclear)} MW`}</div>
                <div>{`${format(prodAvailableRate)}% du dispo.`}</div>
              </div>
              <div
                className="MixView__nuclear__indicator__available"
                style={{
                  width: `${availableSize}%`,
                }}
              />
            </div>
            <div className="MixView__nuclear__available">
              {`${availableCount} réacteurs disponibles: ${available} MW (${availabilityRate}%)`}
            </div>
            <div>
              {`dont ${partiallyUnavailableCount} partiellement indisponible${
                partiallyUnavailableCount > 1 ? 's' : ''
              }`}
            </div>
            <div className="MixView__nuclear__stopped">
              {`${totallyUnavailableCount} réacteur${
                totallyUnavailableCount > 1 ? 's' : ''
              } arrêté${totallyUnavailableCount > 1 ? 's' : ''}`}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

MixView.propTypes = {
  mix: PropTypes.arrayOf(MixType).isRequired,
  slotIndex: PropTypes.number.isRequired,
  setSlotIndex: PropTypes.func.isRequired,
  reactorSetIndicators: PropTypes.shape({
    availablePower: PropTypes.number.isRequired,
    totalPower: PropTypes.number.isRequired,
    availableCount: PropTypes.number.isRequired,
    totallyUnavailableCount: PropTypes.number.isRequired,
    partiallyUnavailableCount: PropTypes.number.isRequired,
  }).isRequired,
  currentDate: PropTypes.string.isRequired,
};

const withStateEnhancer = withState('slotIndex', 'setSlotIndex', props =>
  moment().isSame(props.currentDate, 'day')
    ? props.mix.filter(d => !Number.isNaN(d.nuclear)).length - 1
    : moment(props.currentDate).hours() * 4,
);

const mixEnhancer = connect((state, props) => {
  const currentDate = getCurrentDate(props.location);

  return {
    currentDate,
    mix: mixSelector({ date: currentDate }, state),
  };
});

const indicatorsEnhancer = connect((state, props) => ({
  reactorSetIndicators: reactorSetIndicatorsSelector(
    {
      date: props.currentDate,
      slotIndex: Math.floor(props.slotIndex / 4),
    },
    state,
  ),
}));

export default compose(
  mixEnhancer,
  withStateEnhancer,
  indicatorsEnhancer,
)(MixView);
