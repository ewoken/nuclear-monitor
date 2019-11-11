import { getMix } from '../api';

export const MIX_LOAD_ACTION = 'MIX_LOAD_ACTION';
export const MIX_RECEIVE_ACTION = 'MIX_RECEIVE_ACTION';

function loadMixAction() {
  return { type: MIX_LOAD_ACTION };
}

function receiveMixAction({ data, errors }) {
  return { type: MIX_RECEIVE_ACTION, data, errors };
}

export function loadAllMix() {
  return function dispatchLoadAllMix(dispatch) {
    dispatch(loadMixAction());
    return getMix()
      .then(data =>
        dispatch(
          receiveMixAction({
            data,
          }),
        ),
      )
      .catch(
        errors =>
          console.error(errors) || dispatch(receiveMixAction({ errors })),
      );
  };
}

const initialState = {
  loading: false,
  loaded: false,
  errors: null,
  data: {},
};

function mixReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case MIX_LOAD_ACTION:
      return { ...state, loading: true };
    case MIX_RECEIVE_ACTION:
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

export function mixLoadedSelector(state) {
  return state.mix.loaded;
}

export function mixSelector(state) {
  return state.mix.data;
}

export default mixReducer;
