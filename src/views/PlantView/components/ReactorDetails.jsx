import React from 'react';
import PropTypes from 'prop-types';

import { Link as RouterLink } from 'react-router-dom';
import { Descriptions, Icon } from 'antd';
import moment from 'moment-timezone';
import qs from 'qs';

import { ReactorType } from '../../../utils/types';
import Link from '../../../components/Link';

import ReactorLoadChart from './ReactorLoadChart';

function ReactorDetails({ reactor, currentDate }) {
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

      <div>
        <ReactorLoadChart reactor={reactor} />
        <div className="MixView__date">
          {moment(currentDate).isAfter('2012-01-02') ? (
            <RouterLink
              to={location => ({
                pathname: location.pathname,
                search: qs.stringify({
                  date: moment(currentDate)
                    .subtract(1, 'day')
                    .startOf('hour')
                    .toISOString(),
                }),
              })}
            >
              <Icon
                theme="twoTone"
                type="left-circle"
                style={{ fontSize: '18pt' }}
              />
            </RouterLink>
          ) : (
            <div />
          )}
          <div>{moment(currentDate).format('DD/MM/YYYY HH:mm')}</div>
          {!moment().isSame(currentDate, 'day') ? (
            <RouterLink
              to={location => ({
                pathname: location.pathname,
                search: qs.stringify({
                  date: moment(currentDate)
                    .add(1, 'day')
                    .startOf('hour')
                    .toISOString(),
                }),
              })}
            >
              <Icon
                theme="twoTone"
                type="right-circle"
                style={{ fontSize: '18pt' }}
              />
            </RouterLink>
          ) : (
            <div />
          )}
        </div>
      </div>

      {reactor.unavailability && (
        <Descriptions
          title="Indisponibilité"
          size="small"
          bordered
          column={1}
          style={{ marginTop: 10 }}
        >
          <Descriptions.Item label="Début">
            {moment(reactor.unavailability.startDate).format(
              'DD/MM/YYYY HH:mm',
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Fin">
            {moment(reactor.unavailability.endDate).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            {reactor.unavailability.type === 'PLANNED_MAINTENANCE'
              ? 'Planifiée'
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
  currentDate: PropTypes.string.isRequired,
};

export default ReactorDetails;
