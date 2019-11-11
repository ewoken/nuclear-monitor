import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Route, // as BaseRoute,
  Switch,
  Redirect,
  withRouter,
  Link,
  matchPath,
} from 'react-router-dom';
import { Layout, Spin, Row, Col, Drawer, Menu } from 'antd';

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
  productionsErrorSelector,
} from '../store/productions';
import { loadAllMix, mixLoadedSelector } from '../store/mix';

import {
  testScreenType,
  HEADER_HEIGHT,
  DRAWER_WIDTH,
  getWindowHeight,
} from '../utils';
import { PlantType } from '../utils/types';
import PlantMap from './PlantMap';
import {
  loadAllUnavailabilities,
  unavailabilitiesLoadedSelector,
  unavailabilitiesErrorSelector,
} from '../store/unavailabilities';
import {
  loadAllRivers,
  riversLoadedSelector,
  riversSelector,
} from '../store/rivers';
import HomeView from '../views/HomeView';

const PlantsLoader = buildLoader(loadAllPlants);
const ReactorsLoader = buildLoader(loadAllReactors);
const ProductionsLoader = buildLoader(loadAllProductions);
const MixLoader = buildLoader(loadAllMix);
const UnavailabilitiesLoader = buildLoader(loadAllUnavailabilities);
const RiversLoader = buildLoader(loadAllRivers);

function AppLayout(props) {
  const {
    isLoaded,
    plants,
    goTo,
    currentPlantId,
    isFullPage,
    rivers,
    error,
  } = props;
  const isSmallScreen = !testScreenType('sm');
  const drawerHeight = isFullPage ? getWindowHeight() - HEADER_HEIGHT : 220;

  return (
    <div className="AppLayout">
      <PlantsLoader />
      <ReactorsLoader />
      <ProductionsLoader />
      <MixLoader />
      <UnavailabilitiesLoader />
      <RiversLoader />
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
            {error && (
              <div className="AppLayout__errorMessage">
                Une erreur est survenue, veuillez essayer dans quelques minutes
              </div>
            )}
          </div>
        }
      >
        {!isLoaded && <div className="AppLayout__splash" />}
        {isLoaded && (
          <Layout>
            <Drawer
              title={null}
              visible
              placement={isSmallScreen ? 'top' : 'left'}
              style={{ marginTop: HEADER_HEIGHT }}
              mask={false}
              closable={false}
              width={DRAWER_WIDTH}
              height={drawerHeight}
              bodyStyle={{ padding: 0 }}
              drawerStyle={{ transition: 'height 2s ease' }}
            >
              <Switch>
                <Route path="/home" exact component={HomeView} />
                <Route path="/mix" exact component={MixView} />
                <Route path="/plant/:plantId" component={PlantView} />
                <Route
                  component={() => <Redirect to={{ pathname: '/home' }} />}
                />
              </Switch>
            </Drawer>
            <Row>
              <Col span={24}>
                <Layout.Header className="AppLayout__header">
                  <Menu
                    theme="dark"
                    mode="horizontal"
                    className="AppLayout__menu"
                    selectable={false}
                  >
                    <Menu.Item>
                      <Link to="/home">
                        <strong>Nuclear monitor</strong>
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="mix">
                      <Link to="/mix">Mix</Link>
                    </Menu.Item>
                  </Menu>
                </Layout.Header>

                <Layout.Content className="AppLayout__content">
                  <PlantMap
                    plants={plants}
                    rivers={rivers}
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
  isFullPage: PropTypes.bool.isRequired,
  currentPlantId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  rivers: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  error: PropTypes.object,
};

AppLayout.defaultProps = {
  currentPlantId: null,
  error: null,
};

// withRouter needed to prevent blocking
export default withRouter(
  connect((state, props) => {
    const matchPlantPath = matchPath(props.location.pathname, {
      path: '/plant/:id',
      exact: false,
    });
    const prodError = productionsErrorSelector(state);
    const unavailabilitiesError = unavailabilitiesErrorSelector(state);

    return {
      isLoaded:
        plantsLoadedSelector(state) &&
        reactorsLoadedSelector(state) &&
        productionsLoadedSelector(state) &&
        mixLoadedSelector(state) &&
        unavailabilitiesLoadedSelector(state) &&
        riversLoadedSelector(state),
      plants: plantsSelector(state),
      rivers: riversSelector(state),
      goTo: url => props.history.push(url),
      currentPlantId: matchPlantPath && matchPlantPath.params.id,
      isFullPage: !!matchPath(props.location.pathname, {
        path: ['/plant/:id/:reactorIndex', '/mix'],
      }),
      error: prodError || unavailabilitiesError,
    };
  })(AppLayout),
);
