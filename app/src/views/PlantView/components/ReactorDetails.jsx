import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment-timezone';

import { Descriptions, Icon, Tabs } from 'antd';

import { ReactorType } from '../../../utils/types';
import Link from '../../../components/Link';

import ProductionTab from './ProductionTab';
import UnavailabilitiesTab from './UnavailabilitiesTab';

function ReactorDetails({
  reactor,
  currentDate,
  currentTab: tabInput,
  setTab,
}) {
  const currentTab =
    tabInput ||
    (reactor.status === 'RUNNING' ? 'production' : 'unavailabilities');

  return (
    <div className="ReactorDetails">
      <div className="ReactorDetails__header">
        <div className="ReactorDetails__headerLine">
          <div className="ReactorDetails__headerLine__left">
            <div className="ReactorDetails__headerLine__title">
              {reactor.name}
            </div>
            <div>{`(${reactor.netPower_MW} MWe)`}</div>
          </div>

          <div>
            <Link to={`/plant/${reactor.plantId}`}>
              <Icon type="caret-up" theme="filled" />
            </Link>
          </div>
        </div>

        <Tabs activeKey={currentTab} type="card" onChange={setTab}>
          <Tabs.TabPane tab={<Icon type="bars" />} key="info"></Tabs.TabPane>
          <Tabs.TabPane
            tab={<Icon type="thunderbolt" theme="filled" />}
            key="production"
            // eslint-disable-next-line react/jsx-closing-tag-location
          ></Tabs.TabPane>
          <Tabs.TabPane
            tab={<Icon type="tool" theme="filled" />}
            key="unavailabilities"
            // eslint-disable-next-line
          ></Tabs.TabPane>
          {/* <Tabs.TabPane tab="Incidents" key="incidents"></Tabs.TabPane> */}
        </Tabs>
      </div>

      <Tabs
        activeKey={currentTab}
        onChange={setTab}
        renderTabBar={() => <div />}
      >
        <Tabs.TabPane tab="" key="info">
          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="Palier">
              {reactor.stage}
            </Descriptions.Item>
            <Descriptions.Item label="Puissance thermique">
              {`${reactor.thermalPower_MW} MW`}
            </Descriptions.Item>
            <Descriptions.Item label="Puissance électrique brute">
              {`${reactor.rawPower_MW} MW`}
            </Descriptions.Item>
            <Descriptions.Item label="Puissance électrique nette">
              {`${reactor.netPower_MW} MW`}
            </Descriptions.Item>
            <Descriptions.Item label="Aéroréfrigérants">
              {reactor.coolingTowerCount}
            </Descriptions.Item>
            <Descriptions.Item label="Début de construction">
              {reactor.buildStartDate}
            </Descriptions.Item>
            <Descriptions.Item label="Divergence">
              {reactor.firstReactionDate}
            </Descriptions.Item>
            <Descriptions.Item label="Raccordement au réseau">
              {reactor.gridLinkDate}
            </Descriptions.Item>
            <Descriptions.Item label="Début d'exploitation">
              {reactor.exploitationStartDate}
              <br />
              <strong>
                {` (${moment().diff(
                  moment(reactor.exploitationStartDate, 'DD/MM/YYYY'),
                  'years',
                )} ans)`}
              </strong>
            </Descriptions.Item>
            {reactor.moxAuthorizationDate && (
              <Descriptions.Item label="Authorisation MOX">
                {reactor.moxAuthorizationDate}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Tabs.TabPane>
        <Tabs.TabPane tab="" key="production">
          <ProductionTab currentDate={currentDate} reactor={reactor} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="" key="unavailabilities">
          <UnavailabilitiesTab reactor={reactor} currentDate={currentDate} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

ReactorDetails.propTypes = {
  reactor: ReactorType.isRequired,
  currentDate: PropTypes.string.isRequired,
  currentTab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
};

export default ReactorDetails;
