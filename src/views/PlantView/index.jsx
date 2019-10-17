import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Row, Col, Select, Tag } from 'antd';
import { plantSelector, plantsSelector } from '../../store/plants';
import { PlantType, ReactorType } from '../../utils/types';
import ReactorIndicator from './components/ReactorIndicator';
import { reactorsOfPlantSelector } from '../../store/reactors';
import { actualProdOfReactor } from '../../store/productions';

function PlantView(props) {
  const { plants, currentPlant, reactors, goTo } = props;
  return (
    <div className="PlantView">
      <Row>
        <Col span={24}>
          <div className="PlantView__firstRow">
            <div className="PlantView__firstRow__left">
              <Select
                value={currentPlant.id}
                onChange={id => goTo(`/plant/${id}`)}
                style={{ width: '9em' }}
              >
                {plants.map(plant => (
                  <Select.Option key={plant.id} value={plant.id}>
                    {plant.name}
                  </Select.Option>
                ))}
              </Select>
              <span>
                <Tag style={{ marginLeft: '8px' }}>
                  {currentPlant.coolingType === 'SEA' ? 'Mer' : 'Fleuve'}
                </Tag>
              </span>
            </div>
            <div className="PlantView__firstRow__right">
              <a
                href={currentPlant.wikiLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="PlantView__wiki" src="wiki.svg" alt="wiki" />
              </a>
              <a
                href={currentPlant.asnLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="PlantView__asn" src="logo-asn.png" alt="asn" />
              </a>
            </div>
          </div>

          {/* {currentPlant.hasCoolingTower && (
            <span>
              {reactors.map(() => (
                <img
                  src="coolingTower.svg"
                  alt="cooling tower"
                  style={{ heigth: 15, width: 15, margin: 1 }}
                />
              ))}
            </span>
          )} */}

          <div className="PlantView__schema">
            <div className="PlantView__reactors">
              {reactors.map(reactor => (
                <ReactorIndicator key={reactor.eicCode} reactor={reactor} />
              ))}
            </div>
            <div
              className="PlantView__cooling"
              style={{ width: reactors.length * 50 }}
            >
              {currentPlant.coolingPlace}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

PlantView.propTypes = {
  plants: PropTypes.arrayOf(PlantType).isRequired,
  currentPlant: PlantType.isRequired,
  reactors: PropTypes.arrayOf(ReactorType).isRequired,
  goTo: PropTypes.func.isRequired,
};

export default connect((state, props) => {
  const { plantId } = props.match.params;
  const reactors = reactorsOfPlantSelector(plantId, state).map(reactor => ({
    ...reactor,
    actualProd: actualProdOfReactor(reactor.eicCode, state).value,
  }));

  return {
    plants: plantsSelector(state),
    currentPlant: plantSelector(plantId, state),
    goTo: url => props.history.push(url),
    reactors,
  };
})(PlantView);
