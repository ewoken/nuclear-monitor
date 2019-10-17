import React from 'react';

const { ReactorType } = require('../../../utils/types');

function ReactorIndicator(props) {
  const { reactor } = props;
  const absLoad = Math.max(0, reactor.actualProd);
  const part = Math.floor((absLoad / reactor.power_MW) * 100);

  return (
    <div
      className="ReactIndicator"
      style={{
        background: `linear-gradient(0deg, #26a65b 0%, #26a65b ${part}%, rgba(255,255,255,1) ${part}%)`,
      }}
    >
      <strong>{Math.floor(absLoad)}</strong>
      <br />
      <strong>MW</strong>
      <div className="ReactIndicator__number">{reactor.reactorIndex}</div>
    </div>
  );
}

ReactorIndicator.propTypes = {
  reactor: ReactorType.isRequired,
};

export default ReactorIndicator;
