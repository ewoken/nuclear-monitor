import { values, indexBy, prop } from 'ramda';
import moment from 'moment';

import { getProductions } from '../api';

export const PRODUCTIONS_LOAD_ACTION = 'PRODUCTIONS_LOAD_ACTION';
export const PRODUCTIONS_RECEIVE_ACTION = 'PRODUCTIONS_RECEIVE_ACTION';

function loadProductionsAction({ date }) {
  return { type: PRODUCTIONS_LOAD_ACTION, date };
}

function receiveProductionsAction({ date, data, errors }) {
  return { type: PRODUCTIONS_RECEIVE_ACTION, date, data, errors };
}

const initialState = {};
function productionsReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case PRODUCTIONS_LOAD_ACTION:
      return {
        ...state,
        [action.date]: {
          loading: true,
          loaded: false,
          errors: null,
          data: {},
        },
      };
    case PRODUCTIONS_RECEIVE_ACTION:
      return {
        ...state,
        [action.date]: {
          loading: false,
          loaded: !action.errors,
          errors: action.errors || null,
          data: indexBy(prop('eicCode'), action.data.productions),
        },
      };
    default:
      return state;
  }
}

export function productionsLoadedSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.productions[date] && state.productions[date].loaded;
}

export function productionsErrorSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.productions[date] && state.productions[date].errors;
}

export function productionsSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.productions[date] && values(state.productions[date].data);
}

export function productionSelector({ date: inputDate, eicCode }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return (
    state.productions[date] &&
    state.productions[date].data[eicCode] &&
    state.productions[date].data[eicCode].values
  );
}

export function loadAllProductions({ date: inputDate }) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return function dispatchLoadAllProductions(dispatch, getState) {
    if (productionsLoadedSelector({ date }, getState())) {
      return Promise.resolve();
    }

    dispatch(loadProductionsAction({ date }));
    return getProductions({ date })
      .then(data =>
        dispatch(
          receiveProductionsAction({
            date,
            data,
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) ||
          dispatch(receiveProductionsAction({ date, errors })),
      );
  };
}

export default productionsReducer;
