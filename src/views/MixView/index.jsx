import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withState, compose } from 'recompose';

import { Row, Col } from 'antd';

import moment from 'moment-timezone';

import { format } from '../../utils/index';
import { MixType } from '../../utils/types';
import { mixSelector } from '../../store/mix';
import { reactorSetIndicatorsSelector } from '../../store/reactors';

import './index.css';
import MixComponent from './components/MixComponent';

function MixView(props) {
  const { mix, slotIndex, setSlotIndex, reactorSetIndicators } = props;
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
  const date = moment()
    .tz('Europe/Paris')
    .hour(Math.floor(slotIndex / 4))
    .minutes(15 * ((slotIndex % 4) + 1))
    .format('DD/MM/YYYY HH:mm');

  return (
    <div className="MixView">
      <Row>
        <Col span={24}>
          <MixComponent
            mix={mix}
            slotIndex={slotIndex}
            setSlotIndex={setSlotIndex}
          />
          <div className="MixView__date">{date}</div>
          <div className="MixView__nuclear">
            <strong>{`Parc nucléaire (${total} GW):`}</strong>
            <div className="MixView__nuclear__indicator">
              <div
                className="MixView__nuclear__indicator__prod"
                style={{
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
                  width: `${((availablePower - (mix[slotIndex].nuclear || 0)) /
                    totalPower) *
                    100}%`,
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
};

const withStateEnhancer = withState(
  'slotIndex',
  'setSlotIndex',
  props => props.mix.filter(d => !Number.isNaN(d.nuclear)).length - 1,
);

const mixEnhancer = connect(state => ({
  mix: mixSelector(state),
}));

const indicatorsEnhancer = connect((state, props) => ({
  reactorSetIndicators: reactorSetIndicatorsSelector(
    Math.floor(props.slotIndex / 4),
    state,
  ),
}));

export default compose(
  mixEnhancer,
  withStateEnhancer,
  indicatorsEnhancer,
)(MixView);
