import React from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash.debounce';
import moment from 'moment';

import { Slider } from 'antd';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine,
  YAxis,
  Area,
} from 'recharts';

import { MixType } from '../../../utils/types';

import { META, HEADER_ORDER, GRAPH_ORDER, EMISSION_FACTORS } from './config';

function format(v) {
  // eslint-disable-next-line no-restricted-globals
  return isNaN(v) ? '-' : `${v}`;
}

function computeCo2(mix) {
  const a = Object.keys(EMISSION_FACTORS).reduce(
    (sum, key) => ({
      e: sum.e + mix[key] * EMISSION_FACTORS[key],
      total: sum.total + mix[key],
    }),
    {
      e: 0,
      total: 0,
    },
  );
  return a.e / a.total;
}

function MixComponent({ mix, slotIndex, setSlotIndex, currentDate }) {
  return (
    <div className="MixComponent">
      <div className="MixComponent__header">
        {HEADER_ORDER.map(key => (
          <div
            key={key}
            className="MixComponent__header__item"
            style={{
              backgroundColor: META[key].color,
            }}
          >
            {format(Math.abs(mix[slotIndex][key]))}
            <span className="MixComponent__header__item__small"> MW</span>
            <br />
            <span className="MixComponent__header__item__small">
              {META[key].label}
            </span>
          </div>
        ))}
        <div
          className="MixComponent__header__item"
          style={{
            backgroundColor: META.imports.color,
          }}
        >
          {format(Math.max(mix[slotIndex].imports, -mix[slotIndex].exports))}
          <span className="MixComponent__header__item__small"> MW</span>
          <br />
          <span className="MixComponent__header__item__small">
            {mix[slotIndex].exports < 0
              ? META.exports.label
              : META.imports.label}
          </span>
        </div>
        {/* <div className="MixComponent__header__item" /> */}
        <div
          className="MixComponent__header__item"
          style={{ backgroundColor: 'black' }}
        >
          {format(mix[slotIndex].consumption)}
          <span className="MixComponent__header__item__small"> MW</span>
          <br />
          <span className="MixComponent__header__item__small">CONSO</span>
        </div>
        <div className="MixComponent__header__item" style={{ color: 'black' }}>
          {format(Math.ceil(computeCo2(mix[slotIndex])))}
          <br />
          <span className="MixComponent__header__item__small">gCO₂eq/kWh</span>
          {/* <br />
          <span className="MixComponent__header__item__small">EMISSIONS</span> */}
        </div>
      </div>

      <div className="MixComponent__chart">
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
      <div className="MixComponent__sliderContainer">
        <Slider
          min={0}
          max={96}
          style={{ width: '100%' }}
          defaultValue={slotIndex}
          // value={slotIndex}
          onChange={debounce(setSlotIndex, 400)}
          tipFormatter={
            value =>
              moment(currentDate)
                .startOf('day')
                .add(value * 15, 'minutes')
                .format('HH:mm')
            // eslint-disable-next-line react/jsx-curly-newline
          }
        />
      </div>
    </div>
  );
}

MixComponent.propTypes = {
  mix: PropTypes.arrayOf(MixType).isRequired,
  slotIndex: PropTypes.number.isRequired,
  setSlotIndex: PropTypes.func.isRequired,
  currentDate: PropTypes.string.isRequired,
};

export default MixComponent;
