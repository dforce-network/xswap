import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AppNoWeb3 from './AppNoWeb3';
import * as serviceWorker from './serviceWorker';

let root = document.getElementById('root');

if (window.web3 && typeof (window.web3) === 'object') {
    ReactDOM.render(<App />, root);
} else {
    ReactDOM.render(<AppNoWeb3 />, root);
}
// ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
