import moment from 'moment';

import { getMix } from '../api';

export const MIX_LOAD_ACTION = 'MIX_LOAD_ACTION';
export const MIX_RECEIVE_ACTION = 'MIX_RECEIVE_ACTION';

function loadMixAction({ date }) {
  return { type: MIX_LOAD_ACTION, date };
}

function receiveMixAction({ date, data, errors }) {
  return { type: MIX_RECEIVE_ACTION, date, data, errors };
}

const initialState = {};
function mixReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case MIX_LOAD_ACTION:
      return {
        ...state,
        [action.date]: {
          loading: true,
          loaded: false,
          errors: null,
          data: {},
        },
      };
    case MIX_RECEIVE_ACTION:
      return {
        ...state,
        [action.date]: {
          loading: false,
          loaded: !action.errors,
          errors: action.errors || null,
          data: action.data.mix,
        },
      };
    default:
      return state;
  }
}

export function mixLoadedSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.mix[date] && state.mix[date].loaded;
}

export function mixErrorSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.mix[date] && state.mix[date].errors;
}

export function mixSelector({ date: inputDate }, state) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return state.mix[date] && state.mix[date].data;
}

export function loadAllMix({ date: inputDate }) {
  const date = moment(inputDate).format('YYYY-MM-DD');
  return function dispatchLoadAllMix(dispatch, getState) {
    if (mixLoadedSelector({ date }, getState())) {
      return Promise.resolve();
    }

    dispatch(loadMixAction({ date }));
    return getMix({ date })
      .then(data =>
        dispatch(
          receiveMixAction({
            date,
            data,
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) || dispatch(receiveMixAction({ date, errors })),
      );
  };
}

export default mixReducer;
