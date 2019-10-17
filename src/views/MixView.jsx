import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withState } from 'recompose';

import { Row, Col, Slider } from 'antd';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine,
  YAxis,
  Area,
} from 'recharts';

import moment from 'moment-timezone';
import debounce from 'lodash.debounce';

import { MixType } from '../utils/types';
import { mixSelector } from '../store/mix';

const META = {
  hydroPumped: {
    label: 'POMPAGE',
    color: '#114774',
    stackId: '2',
  },
  biomass: {
    label: 'BIOENERG.',
    color: '#166a57',
  },
  wind: {
    label: 'EOLIEN',
    color: '#74cdb9',
  },
  solar: {
    label: 'SOLAIRE',
    color: '#f27406',
  },
  nuclear: {
    label: 'NUCLEAIRE',
    color: '#f5b300',
  },
  hydro: {
    label: 'HYDRAU.',
    color: '#2772b2',
  },
  gas: {
    label: 'GAS',
    color: '#f30a0a',
  },
  coal: {
    label: 'CHARBON',
    color: '#ac8c35',
  },
  oil: {
    label: 'FIOUL',
    color: '#8356a2',
  },
  exports: {
    label: 'EXPORTS',
    color: '#969696',
    stackId: '2',
  },
  imports: {
    label: 'IMPORTS',
    color: '#969696',
  },
};
const GRAPH_ORDER = [
  'hydroPumped',
  'exports',
  'biomass',
  'wind',
  'solar',
  'nuclear',
  'hydro',
  'gas',
  'coal',
  'oil',
  'imports',
];
const HEADER_ORDER = [
  'oil',
  'coal',
  'gas',
  'hydro',
  'nuclear',
  'solar',
  'wind',
  'biomass',
  'hydroPumped',
];

function format(v) {
  // eslint-disable-next-line no-restricted-globals
  return isNaN(v) ? '-' : `${v}`;
}

function MixView(props) {
  const { mix, slotIndex, setSlotIndex } = props;

  return (
    <div className="MixView">
      <Row>
        <Col span={24}>
          <div className="MixView__header">
            {HEADER_ORDER.map(key => (
              <div
                key={key}
                className="MixView__header__item"
                style={{
                  backgroundColor: META[key].color,
                }}
              >
                {format(Math.abs(mix[slotIndex][key]))}
                <span className="MixView__header__item__small"> MW</span>
                <br />
                <span className="MixView__header__item__small">
                  {META[key].label}
                </span>
              </div>
            ))}
            <div
              className="MixView__header__item"
              style={{
                backgroundColor: META.imports.color,
              }}
            >
              {format(
                Math.max(mix[slotIndex].imports, -mix[slotIndex].exports),
              )}
              <span className="MixView__header__item__small"> MW</span>
              <br />
              <span className="MixView__header__item__small">
                {mix[slotIndex].exports < 0
                  ? META.exports.label
                  : META.imports.label}
              </span>
            </div>
            <div className="MixView__header__item" />
            <div
              className="MixView__header__item"
              style={{ backgroundColor: 'black' }}
            >
              {format(mix[slotIndex].consumption)}
              <span className="MixView__header__item__small"> MW</span>
              <br />
              <span className="MixView__header__item__small">CONSO</span>
            </div>
          </div>

          <div className="MixView_chart">
            <ResponsiveContainer>
              <ComposedChart data={mix}>
                <YAxis axisLine mirror />
                {GRAPH_ORDER.map(key => (
                  <Area
                    key={key}
                    dataKey={key}
                    type="monotone"
                    activeDot={false}
                    stroke="none"
                    fill={META[key].color}
                    stackId={META[key].stackId || '1'}
                  />
                ))}
                <Line
                  dataKey="consumption"
                  dot={false}
                  activeDot={false}
                  type="monotone"
                  stroke="black"
                />
                <ReferenceLine x={slotIndex} stroke="#4b4e52" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="MixView__sliderContainer">
            <Slider
              min={0}
              max={95}
              style={{ width: '100%' }}
              defaultValue={slotIndex}
              // value={slotIndex}
              onChange={debounce(setSlotIndex, 400)}
              tooltipVisible
              tipFormatter={
                value =>
                  moment()
                    .startOf('day')
                    .add(value * 15, 'minutes')
                    .format('HH:mm')
                // eslint-disable-next-line react/jsx-curly-newline
              }
              // marks={{ 0: '00:00', 48: '12:00', 95: '24:00' }}
            />
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
};

export default connect((state, props) => ({
  mix: mixSelector(state),
}))(
  withState('slotIndex', 'setSlotIndex', () =>
    Math.max(
      Math.floor(moment().diff(moment().startOf('day'), 'minutes') / 15) - 2,
      0,
    ),
  )(MixView),
);
