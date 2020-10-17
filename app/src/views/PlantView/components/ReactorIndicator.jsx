import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import moment from 'moment';

const { ReactorType } = require('../../../utils/types');

function StatusIndicator(props) {
  const style = { fontSize: 16 };
  switch (props.status) {
    case 'PLANNED_STOP':
      return (
        <Icon
          type="tool"
          theme="filled"
          style={{ ...style, color: '#404040' }}
        />
      );
    case 'UNPLANNED_REDUCTION':
    case 'AUTO_STOP':
      return (
        <Icon
          type="exclamation-circle"
          theme="twoTone"
          twoToneColor="red"
          style={style}
        />
      );
    case 'PLANNED_REDUCTION':
      return <Icon type="info-circle" theme="twoTone" style={style} />;
    default:
      return null;
  }
}
StatusIndicator.propTypes = {
  status: PropTypes.string.isRequired,
};

function ReactorIndicator(props) {
  const { reactor, currentDate } = props;
  const prods = reactor.dayProductions;
  const hourIndex = moment(currentDate).hours();
  const lastIndex = reactor.dayProductions.reduce(
    (last, v, i) => (v.value === null ? last : i),
    0,
  );

  const index = Math.min(lastIndex, hourIndex);
  const currentProd = prods[index];
  const absLoad = Math.max(0, currentProd.value);
  const part = Math.floor((absLoad / reactor.netPower_MW) * 100);

  return (
    <div
      className="ReactIndicator"
      style={{
        background: `linear-gradient(0deg, #26a65b 0%, #26a65b ${part}%, rgba(255,255,255,1) ${part}%)`,
      }}
    >
      <div className="ReactIndicator__status">
        <StatusIndicator status={reactor.status} />
      </div>
      <div className="ReactIndicator__prod">
        <strong>{Math.floor(absLoad)}</strong>
      </div>
      <div className="ReactIndicator__number">{reactor.reactorIndex}</div>
    </div>
  );
}

ReactorIndicator.propTypes = {
  reactor: ReactorType.isRequired,
  currentDate: PropTypes.string.isRequired,
};

export default ReactorIndicator;
