import { values } from 'ramda';

import moment from 'moment';
import { getUnavailabilities } from '../api';

export const UNAVAILABILITIES_LOAD_ACTION = 'UNAVAILABILITIES_LOAD_ACTION';
export const UNAVAILABILITIES_RECEIVE_ACTION =
  'UNAVAILABILITIES_RECEIVE_ACTION';

function loadUnavailabilitiesAction({ date }) {
  return { type: UNAVAILABILITIES_LOAD_ACTION, date };
}

function receiveUnavailabilitiesAction({ date, data, errors }) {
  return { type: UNAVAILABILITIES_RECEIVE_ACTION, date, data, errors };
}

const initialState = {};
function unavailabilitiesReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case UNAVAILABILITIES_LOAD_ACTION:
      return {
        ...state,
        [action.date]: {
          loading: true,
          loaded: true,
          errors: null,
          data: [],
        },
      };
    case UNAVAILABILITIES_RECEIVE_ACTION:
      return {
        ...state,
        [action.date]: {
          loading: false,
          loaded: !action.errors,
          errors: action.errors || null,
          data: action.data,
        },
      };
    default:
      return state;
  }
}

export function unavailabilitiesLoadedSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.unavailabilities[date] && state.unavailabilities[date].loaded;
}

export function unavailabilitiesErrorSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.unavailabilities[date] && state.unavailabilities[date].errors;
}

export function unavailabilitiesSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return values(state.unavailabilities[date].data);
}

export function reactorUnavalabilitiesSelector(
  { date: inputDate, eicCode },
  state,
) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return (
    state.unavailabilities[date] &&
    state.unavailabilities[date].data.filter(
      unavailability => unavailability.eicCode === eicCode,
    )
  );
}

export function loadAllUnavailabilities({ date: inputDate }) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return function dispatchLoadAllUnavailabilities(dispatch, getState) {
    if (unavailabilitiesLoadedSelector({ date }, getState())) {
      return Promise.resolve();
    }

    dispatch(loadUnavailabilitiesAction({ date }));
    return getUnavailabilities({ date })
      .then(data =>
        dispatch(
          receiveUnavailabilitiesAction({
            date,
            data,
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) ||
          dispatch(receiveUnavailabilitiesAction({ date, errors })),
      );
  };
}

export default unavailabilitiesReducer;
