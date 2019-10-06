import React from 'react';
import ReactDOM from 'react-dom';
import './frameworks/fonts.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/load_anim.css'
import './frameworks/animate.css'
import './css/index.css'
import { Provider } from 'react-redux'
import store from './store/redux_store'
import App from './components/App'
ReactDOM.render(<Provider store={store}><App /></Provider>,document.getElementById('App'));