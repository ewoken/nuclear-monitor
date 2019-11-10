import React from 'react';

import { ResponsiveContainer, AreaChart, XAxis, YAxis, Area } from 'recharts';

import { ReactorType } from '../../../utils/types';

const TICKS = [0, 12, 24];

function tickFormatter(value) {
  return value ? `${value}:00` : '00:00';
}

function ReactorLoadChart(props) {
  const { reactor } = props;

  const endOfDay = Array.from({
    length: 24 - reactor.dayProductions.length + 1,
  }).map(() => ({ value: null }));
  const data = reactor.dayProductions.concat(endOfDay);

  return (
    <div key={reactor.name} className="ReactorLoadChart">
      <div>Production (MW)</div>
      <div className="ReactorLoadChart__chart">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <XAxis
              domain={[0, 24]}
              ticks={TICKS}
              tickFormatter={tickFormatter}
            />
            <YAxis />
            <Area
              dataKey="value"
              dot={false}
              activeDot={false}
              type="monotone"
              stroke="rgb(28, 114, 64)"
              fill="rgb(38, 166, 91)"
              fillOpacity={1}
            />
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
