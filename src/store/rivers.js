import { getRivers } from '../api';

export const RIVERS_LOAD_ACTION = 'RIVERS_LOAD_ACTION';
export const RIVERS_RECEIVE_ACTION = 'RIVERS_RECEIVE_ACTION';

function loadRiversAction() {
  return { type: RIVERS_LOAD_ACTION };
}

function receiveRiversAction({ data, errors }) {
  return { type: RIVERS_RECEIVE_ACTION, data, errors };
}

export function loadAllRivers() {
  return function dispatchLoadAllRivers(dispatch) {
    dispatch(loadRiversAction());
    return getRivers()
      .then(data =>
        dispatch(
          receiveRiversAction({
            data,
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) || dispatch(receiveRiversAction({ errors })),
      );
  };
}

const initialState = {
  loading: false,
  loaded: false,
  errors: null,
  data: {},
};

function riversReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case RIVERS_LOAD_ACTION:
      return { ...state, loading: true };
    case RIVERS_RECEIVE_ACTION:
      return {
        ...state,
        loading: false,
        loaded: !action.errors,
        errors: action.errors || null,
        data: action.data || {},
      };
    default:
      return state;
  }
}

export function riversLoadedSelector(state) {
  return state.rivers.loaded;
}

export function riversSelector(state) {
  return state.rivers.data;
}

export default riversReducer;
