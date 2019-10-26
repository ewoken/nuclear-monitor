import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router, Route } from 'react-router-dom';

import store from './store';

import AppLayout from './components/AppLayout';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Router>
          <Route path="/">
            <AppLayout />
          </Route>
        </Router>
      </Provider>
    </div>
  );
}

export default App;
