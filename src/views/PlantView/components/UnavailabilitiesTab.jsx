import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment-timezone';

import { Icon, Descriptions, Collapse, Table, Spin } from 'antd';

import { ReactorType } from '../../../utils/types';
import {
  getNextUnavailabilities,
  getFinishedUnavailabilities,
} from '../../../api';

function unavailabilityIcon(unavailability) {
  if (unavailability.type === 'PLANNED_MAINTENANCE') {
    return unavailability.availablePower_MW > 0 ? (
      <Icon type="info-circle" theme="twoTone" />
    ) : (
      <Icon type="tool" theme="filled" style={{ color: '#404040' }} />
    );
  }
  return <Icon type="exclamation-circle" theme="twoTone" twoToneColor="red" />;
}

const COLUMNS = [
  {
    title: '',
    render(_, unavailability) {
      return unavailabilityIcon(unavailability);
    },
  },
  {
    title: 'Début',
    dataIndex: 'startDate',
    key: 'startDate',
    render(startDate) {
      return moment(startDate).format('DD/MM/YYYY');
    },
  },
  {
    title: 'Fin',
    dataIndex: 'endDate',
    key: 'endDate',
    render(startDate) {
      return moment(startDate).format('DD/MM/YYYY');
    },
  },
];

function expandedRowRender(unavailability, withType = false) {
  return (
    <Descriptions size="small" column={1}>
      {withType && (
        <Descriptions.Item label="Type">
          {unavailability.type === 'PLANNED_MAINTENANCE'
            ? 'Planifiée'
            : 'Fortuite'}
        </Descriptions.Item>
      )}
      <Descriptions.Item label="Puissance disponible">
        {`${unavailability.availablePower_MW} MW`}
      </Descriptions.Item>
      <Descriptions.Item label="Description">
        {unavailability.reason}
      </Descriptions.Item>
    </Descriptions>
  );
}

function getInitPanel(currentUnavailability, nextUnavailabilities) {
  if (currentUnavailability) {
    return 'current';
  }

  return nextUnavailabilities && nextUnavailabilities.length > 0
    ? 'next'
    : 'done';
}

const INIT_STATE = {
  loaded: false,
  data: {},
  page: 1,
};
const PAGE_SIZE = 10;

function UnavailabilitiesTab(props) {
  const { reactor, currentDate } = props;

  const [stateDate, setDate] = useState(currentDate);
  const [nextUnavState, setNextUnav] = useState(INIT_STATE);
  const [finishedUnavState, setFinishedUnav] = useState(INIT_STATE);

  useEffect(() => {
    const nextPage = nextUnavState.page;
    const finishedPage = finishedUnavState.page;

    if (currentDate !== stateDate) {
      setDate(currentDate);
      setNextUnav(INIT_STATE);
      setFinishedUnav(INIT_STATE);
    }

    if (!nextUnavState.data[nextPage]) {
      // setNextUnav({ ...nextUnavState, loading: true });
      getNextUnavailabilities({
        date: currentDate,
        eicCode: reactor.eicCode,
        skip: (nextUnavState.page - 1) * PAGE_SIZE,
        limit: 10,
      }).then(res =>
        setNextUnav({
          ...nextUnavState,
          loaded: true,
          total: res.total,
          data: { ...nextUnavState.data, [nextPage]: res.data },
        }),
      );
    }

    if (!finishedUnavState.data[finishedPage]) {
      // setFinishedUnav({ ...finishedUnavState, loading: true });
      getFinishedUnavailabilities({
        date: currentDate,
        eicCode: reactor.eicCode,
        skip: (finishedUnavState.page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }).then(res =>
        setFinishedUnav({
          ...finishedUnavState,
          loaded: true,
          total: res.total,
          data: { ...finishedUnavState.data, [finishedPage]: res.data },
        }),
      );
    }
  }, [
    nextUnavState,
    finishedUnavState,
    nextUnavState.page,
    finishedUnavState.page,
    reactor.eicCode,
    stateDate,
    currentDate,
  ]);

  const mCurrentDate = moment(currentDate);
  const currentUnavailability = reactor.unavailabilities.find(
    u => mCurrentDate.isAfter(u.startDate) && mCurrentDate.isBefore(u.endDate),
  );
  const initPanel = getInitPanel(
    currentUnavailability,
    nextUnavState.data['1'],
  );

  if (!finishedUnavState.loaded || !nextUnavState.loaded) {
    return <Spin loading style={{ marginLeft: '50%' }} />;
  }

  return (
    <div className="UnavailabilitiesTab">
      <Collapse
        defaultActiveKey={[initPanel]}
        accordion
        expandIconPosition="right"
      >
        {currentUnavailability && (
          <Collapse.Panel
            // eslint-disable-next-line
            header={(
              <span>
                <Icon type="clock-circle" theme="filled" />
                {' En cours...'}
              </span>
              // eslint-disable-next-line
            )}
            key="current"
          >
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Début">
                {moment(currentUnavailability.startDate).format(
                  'DD/MM/YYYY HH:mm',
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Fin">
                {moment(currentUnavailability.endDate).format(
                  'DD/MM/YYYY HH:mm',
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {currentUnavailability.type === 'PLANNED_MAINTENANCE'
                  ? 'Planifiée'
                  : 'Fortuite'}
              </Descriptions.Item>
              <Descriptions.Item label="Puissance disponible">
                {`${currentUnavailability.availablePower_MW} MW`}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {currentUnavailability.reason}
              </Descriptions.Item>
            </Descriptions>
          </Collapse.Panel>
        )}
        {nextUnavState.data['1'] && nextUnavState.data['1'].length > 0 && (
          <Collapse.Panel
            // eslint-disable-next-line
            header={(
              <span>
                <Icon type="schedule" theme="filled" />
                {`  À venir (${nextUnavState.total || ''})`}
              </span>
              // eslint-disable-next-line
            )}
            key="next"
          >
            <Table
              loading={!nextUnavState.data[nextUnavState.page]}
              size="small"
              bordered={false}
              pagination={
                nextUnavState.total > PAGE_SIZE
                  ? {
                      current: nextUnavState.page,
                      total: nextUnavState.total,
                      pageSize: PAGE_SIZE,
                    }
                  : false
              }
              expandedRowRender={u => expandedRowRender(u, false)}
              expandRowByClick
              indentSize={0}
              rowKey="id"
              columns={COLUMNS}
              dataSource={nextUnavState.data[nextUnavState.page]}
              onChange={
                pager => setNextUnav({ ...nextUnavState, page: pager.current })
                // eslint-disable-next-line react/jsx-curly-newline
              }
            />
          </Collapse.Panel>
        )}
        <Collapse.Panel
          // eslint-disable-next-line
          header={(
            <span>
              <Icon type="check-square" theme="filled" />
              {`  Passées (${finishedUnavState.total || ''})`}
            </span>
            // eslint-disable-next-line
          )}
          key="done"
        >
          <Table
            loading={!finishedUnavState.data[finishedUnavState.page]}
            size="small"
            bordered={false}
            pagination={
              finishedUnavState.total > PAGE_SIZE
                ? {
                    current: finishedUnavState.page,
                    total: finishedUnavState.total,
                    pageSize: PAGE_SIZE,
                  }
                : false
            }
            expandedRowRender={u => expandedRowRender(u, true)}
            expandRowByClick
            indentSize={0}
            rowKey="id"
            columns={COLUMNS}
            dataSource={finishedUnavState.data[finishedUnavState.page]}
            onChange={
              pager =>
                setFinishedUnav({ ...finishedUnavState, page: pager.current })
              // eslint-disable-next-line react/jsx-curly-newline
            }
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}

UnavailabilitiesTab.propTypes = {
  reactor: ReactorType.isRequired,
  currentDate: PropTypes.string.isRequired,
};

export default UnavailabilitiesTab;
