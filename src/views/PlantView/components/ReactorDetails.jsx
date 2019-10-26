import React from 'react';

import { Descriptions } from 'antd';
import moment from 'moment-timezone';

import { ReactorType } from '../../../utils/types';

function ReactorDetails({ reactor }) {
  return (
    <div className="ReactorDetails">
      <Descriptions
        title={`Réacteur ${reactor.name}`}
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
