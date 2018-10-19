import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AutorBox from './Autor';
import Home from './Home';
import {Router, Route, browserHistory, IndexRoute} from 'react-router';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    (<Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute path="/" component={Home} />
            <Route path="/autor" component={AutorBox} />
            <Route path="/livro" />
        </Route>
    </Router>),
    document.getElementById('root'));
registerServiceWorker();
