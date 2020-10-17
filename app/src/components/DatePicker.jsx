import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import { withState } from 'recompose';

import { DatePicker as DesktopDatePicker } from 'antd';
import { DatePicker as MobileDatePicker } from 'antd-mobile';

import { isMobileOrTablet } from '../utils/index';

const PROP_TYPES = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onDate: PropTypes.func.isRequired,
};

const MIN_DATE = moment('2012-01-01').toDate();
const MAX_DATE = moment()
  .endOf('day')
  .toDate();

function WrappedDesktopDatePicker(props) {
  const { children, isOpen, setIsOpen, value, onDate } = props;
  return (
    <div>
      <div
        role="button"
        tabIndex="0"
        onKeyDown={() => {}}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>

      <DesktopDatePicker
        open={isOpen}
        style={{ display: 'none' }}
        defaultValue={moment(value)}
        disabledDate={
          current =>
            moment().isBefore(current) || moment(MIN_DATE).isAfter(current)
          // eslint-disable-next-line react/jsx-curly-newline
        }
        showTime={{
          minuteStep: 60,
          secondStep: 60,
        }}
        onOk={date => {
          setIsOpen(false);
          onDate(date);
        }}
      />
    </div>
  );
}

WrappedDesktopDatePicker.propTypes = {
  ...PROP_TYPES,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.bool.isRequired,
};

const DesktopDatePickerContainer = withState('isOpen', 'setIsOpen', false)(
  WrappedDesktopDatePicker,
);

function DatePicker(props) {
  const { value, children, onDate } = props;

  if (isMobileOrTablet()) {
    return (
      <MobileDatePicker
        locale={{
          okText: 'OK',
          dismissText: 'Today',
          DatePickerLocale: {
            year: '',
            month: '',
            day: '',
            hour: 'h',
            minute: '',
          },
        }}
        onOk={onDate}
        onDismiss={onDate}
        value={moment(value)
          .minutes(0)
          .toDate()}
        minuteStep={60}
        minDate={MIN_DATE}
        maxDate={MAX_DATE}
      >
        {children}
      </MobileDatePicker>
    );
  }

  return (
    <DesktopDatePickerContainer value={value} onDate={onDate}>
      {children}
    </DesktopDatePickerContainer>
  );
}

DatePicker.propTypes = {
  ...PROP_TYPES,
};

export default DatePicker;
