/* eslint-disable import/first */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

async function refresh(callback) {
    fetch('https://api.is-up.link:24499/get-statuses/')
        .then((result) => {
            result.json().then(callback)
        })
}

async function connectToWs() {
    const ws = new WebSocket('wss://ws.is-up.link:25945');
    ws.addEventListener('open', function () {
        console.info('ws connected');
    });
    return ws;
}
(async () => {
    const ws = await connectToWs();
    ReactDOM.render(
        <React.StrictMode>
            <App list={[]} refresh={refresh} ws={ws}/>
        </React.StrictMode>,
        document.getElementById('root')
    );
})()

