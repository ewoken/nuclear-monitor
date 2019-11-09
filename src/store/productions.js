import { values, indexBy, prop } from 'ramda';

import { getProductions } from '../api';

export const PRODUCTIONS_LOAD_ACTION = 'PRODUCTIONS_LOAD_ACTION';
export const PRODUCTIONS_RECEIVE_ACTION = 'PRODUCTIONS_RECEIVE_ACTION';

function loadProductionsAction() {
  return { type: PRODUCTIONS_LOAD_ACTION };
}

function receiveProductionsAction({ data, errors }) {
  return { type: PRODUCTIONS_RECEIVE_ACTION, data, errors };
}

export function loadAllProductions() {
  return function dispatchLoadAllProductions(dispatch) {
    dispatch(loadProductionsAction());
    return getProductions()
      .then(data =>
        dispatch(
          receiveProductionsAction({
            data: indexBy(prop('eicCode'), data),
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) &&
          dispatch(receiveProductionsAction({ errors })),
      );
  };
}

const initialState = {
  loading: false,
  loaded: false,
  errors: null,
  data: {},
};

function productionsReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case PRODUCTIONS_LOAD_ACTION:
      return { ...state, loading: true };
    case PRODUCTIONS_RECEIVE_ACTION:
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

export function productionsLoadedSelector(state) {
  return state.productions.loaded;
}

export function productionsSelector(state) {
  return values(state.productions.data);
}

export function productionSelector(eicCode, state) {
  return (
    state.productions.data[eicCode] && state.productions.data[eicCode].values
  );
}

export default productionsReducer;
