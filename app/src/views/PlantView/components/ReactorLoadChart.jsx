import React, { useState } from 'react';

import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Area,
  Tooltip,
} from 'recharts';

import { ReactorType } from '../../../utils/types';

const TICKS = [0, 12, 24];

function tickFormatter(value) {
  return value ? `${value}:00` : '00:00';
}

function ReactorLoadChart(props) {
  const { reactor } = props;
  const [indexSelected, setSelected] = useState(null);
  const hour =
    indexSelected > 9 ? `${indexSelected}:00` : `0${indexSelected}:00`;
  const prod =
    indexSelected !== null &&
    reactor.dayProductions[indexSelected].value != null
      ? `${Math.floor(reactor.dayProductions[indexSelected].value)}`
      : '-';

  return (
    <div key={reactor.name} className="ReactorLoadChart">
      <div>{`${indexSelected !== null ? `À ${hour}: ${prod} ` : ''}MW`}</div>
      <div className="ReactorLoadChart__chart">
        <ResponsiveContainer>
          <AreaChart
            data={reactor.dayProductions}
            onClick={v => {
              setSelected(v && v.activeTooltipIndex);
              return v;
            }}
          >
            <XAxis
              domain={[0, 24]}
              ticks={TICKS}
              tickFormatter={tickFormatter}
            />
            <YAxis />
            <Area
              dataKey="value"
              dot={false}
              activeDot={v => {
                setSelected(v.index);
                return null;
              }}
              type="monotone"
              stroke="rgb(28, 114, 64)"
              fill="rgb(38, 166, 91)"
              fillOpacity={1}
            />
            <Tooltip content={() => null} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

ReactorLoadChart.propTypes = {
  reactor: ReactorType.isRequired,
};

export default ReactorLoadChart;
