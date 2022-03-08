import './App.css';
import React, {useState, useEffect} from 'react';

const Item = ({name, alive, reason, time}) => {
    const className = alive ? "active-item" : reason && (["block", "block?", "ssl"].includes(reason)) ? "protected-item" : "inactive-item";
    return (
            <div className={`item ${className}`}>
                <a href={`https://${name}`} target="_blank" rel="noreferrer">
                    <span><b>{name}</b></span>
                </a>
                {reason ? <span>Reason: {reason}</span> : null}
                {time ? <span>Response time: {time} ms</span> : null}
                <input type="button" value="Copy address" onClick={() => navigator.clipboard.writeText(name)}/>
            </div>
    );
}

function App({ refresh, ws }) {
    const [items, setItems] = useState(null);
    useEffect(() => {
        const handleMessage = payload => {
            try {
                const eventData = JSON.parse(payload.data);
                const { name, data } = eventData;
                setItems({ ...items, [name]: data });
                console.info("updated", name);
            } catch (e) {
                console.error(e);
            }
        }
        ws.addEventListener('message', handleMessage);
        return () => {
            ws.removeEventListener('message', handleMessage);
        };
    });
    if(!items) {
        refresh(setItems);
        return null;
    }
    const sites = Object.keys(items).sort((a, b) => items[b].alive - items[a].alive);
    return (
        <React.Fragment>
        <input type="button" value={"refresh"} onClick={() => {
            refresh(setItems)
        }} />
        <div className="App">
            {
                sites.map((val, i) => {
                    const item = items[val];
                    return <Item key={i} name={val} alive={item.alive} reason={item.reason} time={item.time} />
                })
            }
        </div>
        </React.Fragment>
    );
}

export default App;
