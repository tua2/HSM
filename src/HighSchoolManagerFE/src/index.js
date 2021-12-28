import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import axios from 'axios';
import 'antd/dist/antd';

axios.defaults.baseURL = 'http://127.0.0.1:8080/api';
//axios.defaults.headers = {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'};
//axios.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
//axios.defaults.headers.common['Content-Type'] = 'application/json; charset=UTF-8';

//const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>, rootElement);

serviceWorker.unregister();
