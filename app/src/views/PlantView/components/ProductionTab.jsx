import React from 'react';
import PropTypes from 'prop-types';

import { Link as RouterLink } from 'react-router-dom';
import { Icon } from 'antd';
import moment from 'moment-timezone';
import qs from 'qs';

import { ReactorType } from '../../../utils/types';

import ReactorLoadChart from './ReactorLoadChart';

function ProductionTab({ reactor, currentDate }) {
  return (
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
              hash: 'production',
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
        <div>{moment(currentDate).format('DD/MM/YYYY')}</div>
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
              hash: 'production',
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
  );
}

ProductionTab.propTypes = {
  reactor: ReactorType.isRequired,
  currentDate: PropTypes.string.isRequired,
};

export default ProductionTab;
