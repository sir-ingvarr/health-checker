import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
const { REACT_APP_API_URL: API_URL, REACT_APP_WS_URL: WS_URL } = process.env;

async function refresh(callback) {
    fetch(`${API_URL}/get-statuses/`)
        .then((result) => {
            result.json().then(callback)
        })
}

async function connectToWs() {
    const ws = new WebSocket(WS_URL);
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

