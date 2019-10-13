import { values, indexBy, prop } from 'ramda';

import { getReactors } from '../api';

export const REACTORS_LOAD_ACTION = 'REACTORS_LOAD_ACTION';
export const REACTORS_RECEIVE_ACTION = 'REACTORS_RECEIVE_ACTION';

function loadReactorsAction() {
  return { type: REACTORS_LOAD_ACTION };
}

function receiveReactorsAction({ data, errors }) {
  return { type: REACTORS_RECEIVE_ACTION, data, errors };
}

export function loadAllReactors() {
  return function dispatchLoadAllReactors(dispatch) {
    dispatch(loadReactorsAction());
    return getReactors()
      .then(data =>
        dispatch(
          receiveReactorsAction({
            data: indexBy(prop('eicCode'), data),
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) && dispatch(receiveReactorsAction({ errors })),
      );
  };
}

const initialState = {
  loading: false,
  loaded: false,
  errors: null,
  data: {},
};

function reactorsReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case REACTORS_LOAD_ACTION:
      return { ...state, loading: true };
    case REACTORS_RECEIVE_ACTION:
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

export function reactorsLoadedSelector(state) {
  return state.reactors.loaded;
}

export function reactorsSelector(state) {
  return values(state.reactors.data);
}

export function reactorSelector(eicCode, state) {
  return state.reactors.data[eicCode];
}

export function reactorsOfPlantSelector(plantId, state) {
  return Object.values(state.reactors.data).filter(
    reactor => reactor.plantId === plantId,
  );
}

export default reactorsReducer;
