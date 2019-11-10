import React from 'react';

import { Link } from 'react-router-dom';
import { Descriptions, Icon } from 'antd';
import moment from 'moment-timezone';

import { ReactorType } from '../../../utils/types';

import ReactorLoadChart from './ReactorLoadChart';

function shouldDisplayLoadGraph(reactor) {
  if (!reactor.unavailability) {
    return true;
  }
  const startDate = moment(reactor.unavailability.startDate);

  return (
    reactor.unavailability.availablePower_MW > 0 ||
    startDate.isAfter(moment().startOf('day')) ||
    moment().diff(startDate, 'hours') < 6
  );
}

function ReactorDetails({ reactor }) {
  return (
    <div className="ReactorDetails">
      <Descriptions
        title={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div className="ReactorDetails__header">
            <div>{reactor.name}</div>
            <div>
              <Link to={`/plant/${reactor.plantId}`}>
                <Icon type="caret-up" theme="filled" />
              </Link>
            </div>
          </div>
        }
        size="small"
        bordered
        column={1}
      >
        <Descriptions.Item label="Début d'exploitation">
          {reactor.exploitationStartYear}
        </Descriptions.Item>
        <Descriptions.Item label="Puissance nominale">
          {`${reactor.power_MW} MWe (${reactor.stage})`}
        </Descriptions.Item>
      </Descriptions>

      {shouldDisplayLoadGraph(reactor) && (
        <ReactorLoadChart reactor={reactor} />
      )}

      {reactor.unavailability && (
        <Descriptions
          title="Indisponibilité"
          size="small"
          bordered
          column={1}
          style={{ marginTop: 10 }}
        >
          <Descriptions.Item label="Début">
            {moment(reactor.unavailability.startDate)
              .tz('Europe/Paris')
              .format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Fin">
            {moment(reactor.unavailability.endDate)
              .tz('Europe/Paris')
              .format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            {reactor.unavailability.type === 'PLANNED_MAINTENANCE'
              ? 'Plannifiée'
              : 'Fortuite'}
          </Descriptions.Item>
          <Descriptions.Item label="Puissance disponible">
            {`${reactor.unavailability.availablePower_MW} MW`}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {reactor.unavailability.reason}
          </Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );
}

ReactorDetails.propTypes = {
  reactor: ReactorType.isRequired,
};

export default ReactorDetails;
