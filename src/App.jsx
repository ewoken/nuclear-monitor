import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router, Route } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/fr';

import store from './store';

import AppLayout from './components/AppLayout';

moment.locale('fr');
moment.tz.setDefault('Europe/Paris');

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
