import { values, indexBy, prop, sortBy } from 'ramda';
import moment from 'moment';

import { getReactors } from '../api';

import { productionSelector } from './productions';
import { unavalabilitySelector } from './unavailabilities';

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
          console.error(errors) || dispatch(receiveReactorsAction({ errors })),
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

function getStatus(unavailability) {
  if (unavailability) {
    if (unavailability.type === 'PLANNED_MAINTENANCE') {
      if (unavailability.availablePower_MW === 0) {
        return 'PLANNED_STOP';
      }
      return 'PLANNED_REDUCTION';
    }
    if (unavailability.availablePower_MW === 0) {
      return 'AUTO_STOP';
    }
    return 'UNPLANNED_REDUCTION';
  }
  return 'RUNNING';
}

export function reactorSelector({ eicCode, date }, state) {
  const reactor = state.reactors.data[eicCode];
  const dayProductions = productionSelector({ eicCode, date }, state);
  const unavailability = unavalabilitySelector({ eicCode, date }, state);

  return {
    ...reactor,
    status: getStatus(unavailability),
    dayProductions,
    unavailability,
  };
}

export function reactorsSelector({ date }, state) {
  return values(state.reactors.data).map(reactor =>
    reactorSelector({ eicCode: reactor.eicCode, date }, state),
  );
}

export function reactorsOfPlantSelector({ plantId, date }, state) {
  const reactors = Object.values(state.reactors.data)
    .filter(reactor => reactor.plantId === plantId)
    .map(reactor => reactorSelector({ eicCode: reactor.eicCode, date }, state));

  return sortBy(prop('reactorIndex'), reactors);
}

const INIT_DATA = {
  availablePower: 0,
  totalPower: 0,
  availableCount: 0,
  partiallyUnavailableCount: 0,
  totallyUnavailableCount: 0,
};
export function reactorSetIndicatorsSelector(
  { date: dateString, slotIndex },
  state,
) {
  const date = moment(dateString)
    .startOf('day')
    .add(slotIndex * 15, 'minutes');
  const reactors = reactorsSelector({ date: dateString }, state);

  return reactors.reduce((res, reactor) => {
    const res2 = {
      availablePower: 0,
      availableCount: 0,
      partially: 0,
      totally: 0,
    };

    if (
      reactor.unavailability &&
      date.isAfter(reactor.unavailability.startDate) &&
      date.isBefore(reactor.unavailability.endDate)
    ) {
      if (reactor.unavailability.availablePower_MW === 0) {
        res2.totally = 1;
      } else {
        res2.availableCount = 1;
        res2.partially = 1;
      }
      res2.availablePower = reactor.unavailability.availablePower_MW;
    } else {
      res2.availableCount = 1;
      res2.availablePower = reactor.power_MW;
    }

    return {
      totalPower: res.totalPower + reactor.power_MW,
      availablePower: res.availablePower + res2.availablePower,
      availableCount: res.availableCount + res2.availableCount,
      totallyUnavailableCount: res.totallyUnavailableCount + res2.totally,
      partiallyUnavailableCount: res.partiallyUnavailableCount + res2.partially,
    };
  }, INIT_DATA);
}

export function reactorByPlantAndIndexSelector(
  { plantId, reactorIndex, date },
  state,
) {
  const reacto = Object.values(state.reactors.data).find(
    reactor =>
      reactor.plantId === plantId && reactor.reactorIndex === reactorIndex,
  );
  return reacto && reactorSelector({ eicCode: reacto.eicCode, date }, state);
}

export function reactorsOfPlant(plantId, state) {
  return Object.values(state.reactors.data)
    .filter(r => r.plantId === plantId)
    .map(r => reactorSelector(r.eicCode, state));
}

export default reactorsReducer;
