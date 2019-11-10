import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Route, // as BaseRoute,
  Switch,
  Link,
  Redirect,
} from 'react-router-dom';
import { Row, Col, Select, Tag, Dropdown, Menu, Button } from 'antd';

import { plantSelector, plantsSelector } from '../../store/plants';
import { PlantType, ReactorType } from '../../utils/types';
import ReactorIndicator from './components/ReactorIndicator';
import {
  reactorsOfPlantSelector,
  reactorByPlantAndIndexSelector,
} from '../../store/reactors';
import ReactorDetails from './components/ReactorDetails';
import PlantPictures from './components/PlantPictures';

import './index.css';

const ReactorDetailsContainer = connect((state, props) => {
  return {
    reactor: reactorByPlantAndIndexSelector(
      {
        plantId: props.match.params.plantId,
        reactorIndex: Number(props.match.params.reactorIndex),
      },
      state,
    ),
  };
})(ReactorDetails);

function plantMenu(plant) {
  return (
    <Menu>
      <Menu.Item>
        <a href={plant.wikiLink} target="_blank" rel="noopener noreferrer">
          {/* <img className="PlantView__wiki" src="wiki.svg" alt="wiki" /> */}
          Wikipedia
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href={plant.asnLink} target="_blank" rel="noopener noreferrer">
          {/* <img className="PlantView__asn" src="logo-asn.png" alt="asn" /> */}
          ASN
        </a>
      </Menu.Item>
    </Menu>
  );
}

function PlantView(props) {
  const { plants, currentPlant, reactors, goTo } = props;

  if (!currentPlant) {
    return <Redirect to="/" />;
  }

  return (
    <div className="PlantView">
      <Row>
        <Col span={24}>
          <div className="PlantView__firstRow">
            <div className="PlantView__firstRow__left">
              <Select
                value={currentPlant.id}
                size="large"
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
              <Link to={`/plant/${currentPlant.id}/pictures`}>
                <Button icon="picture" style={{ marginRight: 5 }} />
              </Link>
              <Dropdown
                overlay={plantMenu(currentPlant)}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button icon="more" />
              </Dropdown>
            </div>
          </div>

          <div className="PlantView__schema">
            <div>Production (MW)</div>
            <div className="PlantView__reactors">
              {reactors.map(reactor => (
                <Link
                  key={reactor.eicCode}
                  to={`/plant/${currentPlant.id}/${reactor.reactorIndex}`}
                >
                  <ReactorIndicator reactor={reactor} />
                </Link>
              ))}
            </div>
            <div
              className="PlantView__cooling"
              style={{ width: reactors.length * 50 }}
            >
              {currentPlant.coolingPlace}
            </div>
          </div>
          <div className="PlantView__footer">
            <Switch>
              <Route
                path="/plant/:plantId/pictures"
                component={() => <PlantPictures plant={currentPlant} />}
              />
              <Route
                path="/plant/:plantId/:reactorIndex"
                component={ReactorDetailsContainer}
              />
              <Route
                component={() => (
                  <small>(Cliquer sur un réacteur pour plus de détails)</small>
                )}
              />
            </Switch>
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
  const reactors = reactorsOfPlantSelector(plantId, state);

  return {
    plants: plantsSelector(state),
    currentPlant: plantSelector(plantId, state),
    goTo: url => props.history.push(url),
    reactors,
  };
})(PlantView);
