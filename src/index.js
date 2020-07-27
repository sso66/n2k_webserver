// File: src/index.js
// Note: Main entry to web services
// Date: 01/15/2020
//..................................................................................................
import React from 'react';
import ReactDOM from 'react-dom';

import './index.sass';
import App from './App';
import * as serviceWorker from './serviceWorker';

console.log( "--> src/index.js" );
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
console.log( "<-- src/index.js" );