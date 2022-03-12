import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import List from './List';
const { REACT_APP_API_URL: API_URL, REACT_APP_WS_URL: WS_URL } = process.env;

const DataProvider = ({ children, childrenProps }) => {
    const [items, setItems] = useState({});
    const ws = useRef(null);
    const itemsRef = useRef(items);

    const updateItems = (data) => {
        setItems(data);
        itemsRef.current = data;
    }

    const refresh = async () => {
        try {
            const res = await fetch(`${API_URL}/get-statuses/`);
            const resJson = await res.json();
            updateItems(resJson);
        } catch (e) {}
    }

    const handleMessage = payload => {
        try {
            const eventData = JSON.parse(payload.data);
            const { name, data } = eventData;
            const currentData = itemsRef.current[name] || {};
            updateItems({ ...itemsRef.current, [name]: { ...currentData, ...data }});
        } catch (e) {
            console.error(e);
        }
    }
    useEffect(async () => {
        await refresh();
        ws.current = new WebSocket(WS_URL);
        ws.current.addEventListener('open', () => {
            console.info('ws connected');
        });
        ws.current.addEventListener('message', handleMessage);
    }, []);

    return React.cloneElement(children, { ...childrenProps, items, refresh: () => refresh(setItems)});
}

(async () => {
    ReactDOM.render(
        <React.StrictMode>
            <DataProvider>
                <List />
            </DataProvider>
        </React.StrictMode>,
        document.getElementById('root')
    );
})()

