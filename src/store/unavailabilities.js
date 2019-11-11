import { values, indexBy, prop } from 'ramda';

import { getUnavailabilities } from '../api';

export const UNAVAILABILITIES_LOAD_ACTION = 'UNAVAILABILITIES_LOAD_ACTION';
export const UNAVAILABILITIES_RECEIVE_ACTION =
  'UNAVAILABILITIES_RECEIVE_ACTION';

function loadUnavailabilitiesAction() {
  return { type: UNAVAILABILITIES_LOAD_ACTION };
}

function receiveUnavailabilitiesAction({ data, errors }) {
  return { type: UNAVAILABILITIES_RECEIVE_ACTION, data, errors };
}

export function loadAllUnavailabilities() {
  return function dispatchLoadAllUnavailabilities(dispatch) {
    dispatch(loadUnavailabilitiesAction());
    return getUnavailabilities()
      .then(data =>
        dispatch(
          receiveUnavailabilitiesAction({
            data: indexBy(prop('eicCode'), data),
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) ||
          dispatch(receiveUnavailabilitiesAction({ errors })),
      );
  };
}

const initialState = {
  loading: false,
  loaded: false,
  errors: null,
  data: {},
};

function unavailabilitiesReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case UNAVAILABILITIES_LOAD_ACTION:
      return { ...state, loading: true };
    case UNAVAILABILITIES_RECEIVE_ACTION:
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

export function unavailabilitiesLoadedSelector(state) {
  return state.unavailabilities.loaded;
}

export function unavailabilitiesErrorSelector(state) {
  return state.productions.errors;
}

export function unavailabilitiesSelector(state) {
  return values(state.unavailabilities.data);
}

export function unavalabilitySelector(eicCode, state) {
  return state.unavailabilities.data[eicCode];
}

export default unavailabilitiesReducer;
