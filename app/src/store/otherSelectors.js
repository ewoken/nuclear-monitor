import moment from 'moment-timezone';
import qs from 'qs';

// eslint-disable-next-line import/prefer-default-export
export function getCurrentDate(location) {
  return (
    qs.parse(location.search.substr(1)).date ||
    moment()
      .startOf('hour')
      .toISOString()
  );
}
