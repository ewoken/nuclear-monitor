import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Route, // as BaseRoute,
  Switch,
  Redirect,
  withRouter,
} from 'react-router-dom';
import { Layout, Spin, Row, Col, Drawer } from 'antd';
import { Map, TileLayer, Marker, ZoomControl } from 'react-leaflet';

import MixView from '../views/MixView';
import PlantView from '../views/PlantView';

// import HeaderMenu from './HeaderMenu';

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

import { PlantType } from '../utils/types';

const PlantsLoader = buildLoader(loadAllPlants);
const ReactorsLoader = buildLoader(loadAllReactors);
const ProductionsLoader = buildLoader(loadAllProductions);

// const ConnectedHeaderMenu = withRouter(
//   connect((state, props) => ({
//     countries: countriesSelector(state),
//     areas: areasSelector(state),
//     goTo: url => props.history.push(url),
//   }))(HeaderMenu),
// );

const { body } = document;
const html = document.documentElement;

const height = Math.max(
  body.scrollHeight,
  body.offsetHeight,
  html.clientHeight,
  html.scrollHeight,
  html.offsetHeight,
);

function AppLayout(props) {
  const { isLoaded, plants, goTo } = props;
  return (
    <div className="AppLayout">
      <PlantsLoader />
      <ReactorsLoader />
      <ProductionsLoader />
      <Spin size="large" spinning={!isLoaded}>
        {isLoaded && (
          <Layout>
            <Drawer
              title="Nuclear Monitor"
              visible
              placement="left"
              mask={false}
              closable={false}
              width={300}
            >
              <Switch>
                <Route path="/" exact component={MixView} />
                <Route path="/plant/:plantId" exact component={PlantView} />
                {/* <Route
                path="/country/:countryCode/:tab?"
                exact
                component={CountryView}
              /> */}
                <Route component={() => <Redirect to={{ pathname: '/' }} />} />
              </Switch>
            </Drawer>
            {/* <Layout.Header className="AppLayout__header">
            <ConnectedHeaderMenu />
          </Layout.Header> */}
            <Row>
              <Col span={24}>
                <Layout.Content className="AppLayout__content">
                  <Map
                    center={[47.505, 2]}
                    zoom={6}
                    style={{ height }}
                    zoomControl={false}
                  >
                    <ZoomControl position="topright" />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {plants.map(plant => (
                      <Marker
                        key={plant.id}
                        position={plant.coords}
                        onClick={() => goTo(`/plant/${plant.id}`)}
                      />
                    ))}
                  </Map>
                </Layout.Content>
                {/* <Layout.Footer></Layout.Footer> */}
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
};

// withRouter needed to prevent blocking
export default withRouter(
  connect((state, props) => ({
    isLoaded:
      plantsLoadedSelector(state) &&
      reactorsLoadedSelector(state) &&
      productionsLoadedSelector(state),
    plants: plantsSelector(state),
    goTo: url => props.history.push(url),
  }))(AppLayout),
);
