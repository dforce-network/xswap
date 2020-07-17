import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

let root = document.getElementById('root');
ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
