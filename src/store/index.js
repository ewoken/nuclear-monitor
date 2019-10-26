import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';

import plantsReducer from './plants';
import reactorsReducer from './reactors';
import productionsReducer from './productions';
import mixReducer from './mix';
import unavailabilitiesReducer from './unavailabilities';

const rootReducer = combineReducers({
  // ...reducers,
  plants: plantsReducer,
  reactors: reactorsReducer,
  productions: productionsReducer,
  mix: mixReducer,
  unavailabilities: unavailabilitiesReducer,
});

const enhancers = [applyMiddleware(thunk)];
const composeEnhancers = composeWithDevTools({
  // actionSanitizer,
  // stateSanitizer,
});
const enhancer = composeEnhancers(...enhancers);

const store = createStore(rootReducer, enhancer);

export default store;
