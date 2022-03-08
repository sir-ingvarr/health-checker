import './App.css';
import React, {useState, useEffect} from 'react';

const Item = ({name, alive, reason, time}) => {
    const className = alive
        ? "active-item"
        : reason && (["protected", "protected?", "ssl"].includes(reason))
            ? "protected-item"
            : "inactive-item";
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

const SearchBar = ({onSubmit, onChange}) => {
    const [text, setText] = useState('');
    return (
        <div className="search-bar">
            <label>Search</label>
            <input type="text" value={text} onChange={e => {
                const { value } = e.target;
                setText(value);
                onChange(value);
            }}/>
            {
                onSubmit ? <input type="button" value="search" onClick={() => onSubmit(text)}/> : null
            }
        </div>
    );
};

function App({ refresh, ws }) {
    const [items, setItems] = useState(null);
    const [searchRegex, setSearchRegex] = useState(null);

    const processSearchText = val => {
        if(val && val !== '') return setSearchRegex(new RegExp(val, 'gi'));
        setSearchRegex(null);
    }

    useEffect(() => {
        const handleMessage = payload => {
            try {
                const eventData = JSON.parse(payload.data);
                const { name, data } = eventData;
                setItems({ ...items, [name]: data });
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

    let sites = Object.keys(items);
    const counters = {
        active: 0,
        inactive: 0,
        protected: 0
    }
    if(searchRegex) {
        sites = sites.filter(val => searchRegex.test(val));
    }
    sites = sites
        .map(site => {
            const item = items[site];
            if(!item.alive) {
                if(["protected", "protected?", "ssl"].includes(item.reason)) counters.protected++;
                else counters.inactive++;
            } else counters.active++;
            return site;
        })
        .sort((a, b) => items[b].alive - items[a].alive);

    return (
        <React.Fragment>
        <input type="button" value={"refresh"} onClick={() => {
            refresh(setItems)
        }} />
        <SearchBar onChange={processSearchText}/>
        <div className="counters">
            <div className="active-item">{counters.active}</div>
            <div className="inactive-item">{counters.inactive}</div>
            <div className="protected-item">{counters.protected}</div>
        </div>
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
