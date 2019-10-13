import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';

import store from './store';

import AppLayout from './components/AppLayout';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Router>
          <AppLayout />
        </Router>
      </Provider>
    </div>
  );
}

export default App;
