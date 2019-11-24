import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import moment from 'moment';

import {
  Route, // as BaseRoute,
  Switch,
  Redirect,
  withRouter,
  matchPath,
} from 'react-router-dom';
import { Layout, Spin, Row, Col, Drawer, Menu, Icon } from 'antd';

import HomeView from '../views/HomeView';
import AboutView from '../views/AboutView';
import MixView from '../views/MixView';
import PlantView from '../views/PlantView';

import Link from './Link';
import PlantMap from './PlantMap';
import DatePicker from './DatePicker';

import buildLoader from '../HOC/buildLoader';
import { loadAllPlants, plantsLoadedSelector } from '../store/plants';

import { loadAllReactors, reactorsLoadedSelector } from '../store/reactors';
import {
  loadAllProductions,
  productionsLoadedSelector,
  productionsErrorSelector,
} from '../store/productions';
import { loadAllMix, mixLoadedSelector, mixErrorSelector } from '../store/mix';

import {
  testScreenType,
  HEADER_HEIGHT,
  DRAWER_WIDTH,
  getWindowHeight,
} from '../utils';
import {
  loadAllUnavailabilities,
  unavailabilitiesLoadedSelector,
  unavailabilitiesErrorSelector,
} from '../store/unavailabilities';
import { loadAllRivers, riversLoadedSelector } from '../store/rivers';
import { getCurrentDate } from '../store/otherSelectors';

const PlantsLoader = buildLoader(loadAllPlants);
const ReactorsLoader = buildLoader(loadAllReactors);
const ProductionsLoader = buildLoader(loadAllProductions);
const MixLoader = buildLoader(loadAllMix);
const UnavailabilitiesLoader = buildLoader(loadAllUnavailabilities);
const RiversLoader = buildLoader(loadAllRivers);

function AppLayout(props) {
  const {
    isLoaded,
    error,

    currentPlantId,
    currentLocation,
    currentDate,

    isFullPage,
    goTo,
  } = props;
  const isSmallScreen = !testScreenType('sm');
  const drawerHeight = isFullPage ? getWindowHeight() - HEADER_HEIGHT : 220;

  return (
    <div className="AppLayout">
      <PlantsLoader />
      <ReactorsLoader />
      <RiversLoader />

      <ProductionsLoader date={currentDate} />
      <MixLoader date={currentDate} />
      <UnavailabilitiesLoader date={currentDate} />
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
                <Route path="/about" exact component={AboutView} />
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
                    <Menu.SubMenu
                      title={
                        // eslint-disable-next-line react/jsx-wrap-multilines
                        <span>
                          <Icon type="menu" />
                          <strong>Nuclear monitor</strong>
                        </span>
                      }
                      popupClassName="AppLayout__submenu"
                    >
                      <Menu.Item key="home">
                        <Link to="/home">Accueil</Link>
                      </Menu.Item>
                      <Menu.Item key="mix">
                        <Link to="/mix">Mix</Link>
                      </Menu.Item>
                      <Menu.Item key="about">
                        <Link to="/about">À propos</Link>
                      </Menu.Item>
                    </Menu.SubMenu>
                  </Menu>
                  <DatePicker
                    onDate={
                      v =>
                        moment(v).isSame(moment(), 'day')
                          ? goTo(`${currentLocation}`, false)
                          : goTo(
                              `${currentLocation}?date=${moment(
                                v,
                              ).toISOString()}`,
                              false,
                            )
                      // eslint-disable-next-line react/jsx-curly-newline
                    }
                    value={currentDate}
                  >
                    <div className="AppLayout__header__date">
                      <div className="AppLayout__header__date__text">
                        <div>
                          {moment(currentDate).format('dddd DD/MM/YYYY')}
                        </div>
                        <div>{moment(currentDate).format('à HH:00')}</div>
                      </div>

                      <div className="AppLayout__header__date__calendar">
                        <Icon
                          type="calendar"
                          theme="twoTone"
                          twoToneColor="white"
                        />
                      </div>
                    </div>
                  </DatePicker>
                </Layout.Header>

                <Layout.Content className="AppLayout__content">
                  <PlantMap
                    currentDate={currentDate}
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
  // eslint-disable-next-line react/forbid-prop-types
  error: PropTypes.object,

  goTo: PropTypes.func.isRequired,
  currentLocation: PropTypes.string.isRequired,
  currentDate: PropTypes.string.isRequired,

  isFullPage: PropTypes.bool.isRequired,
  currentPlantId: PropTypes.string,
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
    const currentDate = getCurrentDate(props.location);

    const mixError = mixErrorSelector({ date: currentDate }, state);
    const prodError = productionsErrorSelector({ date: currentDate }, state);
    const unavailabilitiesError = unavailabilitiesErrorSelector(
      { date: currentDate },
      state,
    );

    return {
      isLoaded:
        plantsLoadedSelector(state) &&
        reactorsLoadedSelector(state) &&
        productionsLoadedSelector({ date: currentDate }, state) &&
        mixLoadedSelector({ date: currentDate }, state) &&
        unavailabilitiesLoadedSelector({ date: currentDate }, state) &&
        riversLoadedSelector(state),
      error: prodError || unavailabilitiesError || mixError,

      goTo: (url, withSearch = true) =>
        props.history.push(`${url}${withSearch ? props.location.search : ''}`),
      currentLocation: props.location.pathname,
      currentPlantId: matchPlantPath && matchPlantPath.params.id,
      currentDate,

      isFullPage: !!matchPath(props.location.pathname, {
        path: ['/plant/:id/:reactorIndex', '/mix', '/about'],
      }),
    };
  })(AppLayout),
);
