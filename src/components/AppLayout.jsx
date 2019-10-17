import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Route, // as BaseRoute,
  Switch,
  Redirect,
  withRouter,
  Link,
} from 'react-router-dom';
import { Layout, Spin, Row, Col, Drawer } from 'antd';

import MixView from '../views/MixView';
import PlantView from '../views/PlantView';

import buildLoader from '../HOC/buildLoader';
import {
  loadAllPlants,
  plantsLoadedSelector,
  plantsSelector,
} from '../store/plants';

import { loadAllReactors, reactorsLoadedSelector } from '../store/reactors';
import {
  loadAllProductions,
  productionsLoadedSelector,
} from '../store/productions';
import { loadAllMix, mixLoadedSelector } from '../store/mix';

import { testScreenType, HEADER_HEIGHT, DRAWER_WIDTH } from '../utils';
import { PlantType } from '../utils/types';
import PlantMap from './PlantMap';

const PlantsLoader = buildLoader(loadAllPlants);
const ReactorsLoader = buildLoader(loadAllReactors);
const ProductionsLoader = buildLoader(loadAllProductions);
const MixLoader = buildLoader(loadAllMix);

function AppLayout(props) {
  const { isLoaded, plants, goTo, currentPlantId } = props;
  const isSmallScreen = !testScreenType('sm');
  const drawerHeight = currentPlantId === 'mix' ? 310 : 200;

  return (
    <div className="AppLayout">
      <PlantsLoader />
      <ReactorsLoader />
      <ProductionsLoader />
      <MixLoader />
      <Spin
        size="large"
        spinning={!isLoaded}
        indicator={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div>
            <img
              className="AppLayout__loadingIcon"
              src="loading_icon.svg"
              alt=""
            />
          </div>
        }
      >
        {!isLoaded && <div className="AppLayout__splash" />}
        {isLoaded && (
          <Layout>
            <Drawer
              title={isSmallScreen ? null : <Link to="/">Nuclear monitor</Link>}
              visible
              placement={isSmallScreen ? 'top' : 'left'}
              style={{ marginTop: isSmallScreen ? HEADER_HEIGHT : 0 }}
              mask={false}
              closable={false}
              width={DRAWER_WIDTH}
              height={drawerHeight}
              bodyStyle={{ padding: 0 }}
            >
              <Switch>
                <Route path="/mix" exact component={MixView} />
                <Route path="/plant/:plantId" exact component={PlantView} />
                <Route
                  component={() => <Redirect to={{ pathname: '/mix' }} />}
                />
              </Switch>
            </Drawer>
            <Row>
              <Col span={24}>
                {isSmallScreen && (
                  <Layout.Header className="AppLayout__header">
                    <Link to="/mix">
                      <strong>Nuclear monitor</strong>
                    </Link>
                  </Layout.Header>
                )}
                <Layout.Content className="AppLayout__content">
                  <PlantMap
                    plants={plants}
                    currentPlantId={currentPlantId}
                    onPlantClick={plant => goTo(`/plant/${plant.id}`)}
                    drawerHeight={drawerHeight}
                  />
                </Layout.Content>
              </Col>
            </Row>
          </Layout>
        )}
      </Spin>
    </div>
  );
}

AppLayout.propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  plants: PropTypes.arrayOf(PlantType).isRequired,
  goTo: PropTypes.func.isRequired,
  currentPlantId: PropTypes.string,
};

AppLayout.defaultProps = {
  currentPlantId: null,
};

// withRouter needed to prevent blocking
export default withRouter(
  connect((state, props) => ({
    isLoaded:
      plantsLoadedSelector(state) &&
      reactorsLoadedSelector(state) &&
      productionsLoadedSelector(state) &&
      mixLoadedSelector(state),
    plants: plantsSelector(state),
    goTo: url => props.history.push(url),
    currentPlantId: props.location.pathname.split('/').pop(),
  }))(AppLayout),
);
