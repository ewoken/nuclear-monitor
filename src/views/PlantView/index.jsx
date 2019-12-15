import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Route, // as BaseRoute,
  Switch,
  Redirect,
} from 'react-router-dom';
import { Row, Col, Select, Tag, Dropdown, Menu, Button } from 'antd';

import { plantSelector, plantsSelector } from '../../store/plants';
import { PlantType, ReactorType } from '../../utils/types';
import Link from '../../components/Link';

import ReactorIndicator from './components/ReactorIndicator';
import {
  reactorsOfPlantSelector,
  reactorByPlantAndIndexSelector,
} from '../../store/reactors';
import { getCurrentDate } from '../../store/otherSelectors';

import ReactorDetails from './components/ReactorDetails';
import PlantPictures from './components/PlantPictures';

import './index.css';

const ReactorDetailsContainer = connect((state, props) => {
  const reactor = reactorByPlantAndIndexSelector(
    {
      date: props.currentDate,
      plantId: props.match.params.plantId,
      reactorIndex: Number(props.match.params.reactorIndex),
    },
    state,
  );
  return {
    reactor,
    setTab: tab =>
      props.goTo(
        `/plant/${reactor.plantId}/${reactor.reactorIndex}`,
        `#${tab}`,
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
      <Menu.Item>
        <a href={plant.edfLink} target="_blank" rel="noopener noreferrer">
          {/* <img className="PlantView__asn" src="logo-asn.png" alt="asn" /> */}
          EDF
        </a>
      </Menu.Item>
    </Menu>
  );
}

function PlantView(props) {
  const {
    currentDate,
    currentTab,
    plants,
    currentPlant,
    reactors,
    goTo,
  } = props;

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
                style={{ width: '10em' }}
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
                  <ReactorIndicator
                    reactor={reactor}
                    currentDate={currentDate}
                  />
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
                component={props2 => (
                  <ReactorDetailsContainer
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props2}
                    currentTab={currentTab}
                    currentDate={currentDate}
                    goTo={goTo}
                  />
                )}
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
  currentDate: PropTypes.string.isRequired,
  currentTab: PropTypes.string.isRequired,
  plants: PropTypes.arrayOf(PlantType).isRequired,
  currentPlant: PlantType.isRequired,
  reactors: PropTypes.arrayOf(ReactorType).isRequired,
  goTo: PropTypes.func.isRequired,
};

export default connect((state, props) => {
  const { plantId } = props.match.params;
  const currentDate = getCurrentDate(props.location);
  const currentTab = props.location.hash.substr(1);

  return {
    currentDate,
    currentTab,
    plants: plantsSelector({ date: currentDate }, state),
    currentPlant: plantSelector({ plantId, date: currentDate }, state),
    reactors: reactorsOfPlantSelector({ plantId, date: currentDate }, state),
    goTo: (url, hash = '') =>
      props.history.push(`${url}${props.location.search}${hash}`),
  };
})(PlantView);
