import React from 'react';

const HEIGHT = '70px';
const WIDTH = '50px';

function ReactorIndicator(props) {
  const { power, load } = props;
  const absLoad = load < 0 ? 0 : load;
  const part = Math.floor((absLoad / power) * 100);

  return (
    <span
      className="ReactIndicator"
      style={{
        height: HEIGHT,
        width: WIDTH,
        background: `linear-gradient(0deg, rgba(9,121,23,1) 0%, rgba(9,121,23,1) ${part}%, rgba(255,255,255,1) ${part}%)`,
      }}
    >
      <span className="ReactIndicator__label">{absLoad}</span>
    </span>
  );
}

export default ReactorIndicator;
