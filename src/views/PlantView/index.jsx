import React from 'react';
import { connect } from 'react-redux';

import { Row, Col } from 'antd';
import { plantSelector } from '../../store/plants';
import { PlantType } from '../../utils/types';
import ReactorIndicator from './components/ReactorIndicator';
import { reactorsOfPlantSelector } from '../../store/reactors';
import { actualProdOfReactor } from '../../store/productions';

function PlantView(props) {
  const { plant, reactors } = props;
  return (
    <div className="PlantView">
      <Row>
        <Col span={24}>
          <h2>{plant.name}</h2>
          <div>
            {`${plant.reactors.length} réacteur${
              plant.reactors.length > 1 ? 's' : ''
            }`}
          </div>
          <div>
            {reactors.map(reactor => (
              <ReactorIndicator
                key={reactor.eicCode}
                power={reactor.power_MW}
                load={reactor.actualProd}
              />
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}

PlantView.propTypes = {
  plant: PlantType.isRequired,
};

export default connect((state, props) => {
  const { plantId } = props.match.params;
  const reactors = reactorsOfPlantSelector(plantId, state).map(reactor => ({
    ...reactor,
    actualProd: actualProdOfReactor(reactor.eicCode, state).value,
  }));

  return {
    plant: plantSelector(plantId, state),
    reactors,
  };
})(PlantView);
