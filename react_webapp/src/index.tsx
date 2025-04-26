import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ControlWebsocketHelper from './helpers/ControlWebsocketHelper';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


/* We need to connect to the internal websocket, else the car thing kills the webview */
const _socket_helper = new ControlWebsocketHelper();
