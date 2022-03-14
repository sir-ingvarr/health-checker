import './App.css';
import React, {useState} from 'react';

const Item = ({protocol, name, alive, reason, time, ip, ports}) => {
    let className;
    if(reason === 'loading') className = 'loading-item';
    else {
        className = alive
            ? 'active-item'
            : reason && (['protected', 'protected?', 'ssl'].includes(reason))
                ? 'protected-item'
                : 'inactive-item';
    }
    return (
            <div className={`item ${className}`}>
                <a href={`${protocol}://${name}`} target='_blank' rel='noreferrer'>
                    <span><b>{`${protocol}://${name}`}</b></span>
                </a>
                <span><b>{`IP: ${ip}`}</b></span>
                <span className="port-list">{`Open ports: ${ports && ports.length ? ports.join(',') : ip && !ports ? 'loading...' : 'none'}`}</span>
                {reason ? <span>Reason: {reason}</span> : null}
                {time ? <span>Response time: {time} ms</span> : null}
                { ip
                    ? <input type='button' value='Copy IP' onClick={() => navigator.clipboard.writeText(ip)}/>
                    : null
                }
                <input type='button' value='Copy address' onClick={() => navigator.clipboard.writeText(name)}/>
                <a style={{width: '100%'}} href={'data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify({
                    host: `${protocol}://${name}`,
                    ip, ports
                }))} download={`${name}.json`}>
                <input style={{width: '100%'}} type='button' value='Download JSON'/>
                </a>

            </div>
    );
}

const SearchBar = ({onSubmit, onChange}) => {
    const [text, setText] = useState('');
    return (
        <div className='search-bar'>
            <label>Search</label>
            <input type='text' value={text} onChange={e => {
                const { value } = e.target;
                setText(value);
                onChange(value);
            }}/>
            {
                onSubmit ? <input type='button' value='search' onClick={() => onSubmit(text)}/> : null
            }
        </div>
    );
};

const List = ({ refresh, items }) => {
    const [searchRegex, setSearchRegex] = useState(null);

    const processSearchText = val => {
        if(val && val !== '') return setSearchRegex(new RegExp(val, 'gi'));
        setSearchRegex(null);
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
                if(['protected', 'protected?', 'ssl'].includes(item.reason)) counters.protected++;
                else counters.inactive++;
            } else counters.active++;
            return site;
        })
        .sort((a, b) => {
            const x = items[a].alive;
            const y = items[b].alive;
            return (x === y)? 0 : x? -1 : 1;
        });

    return (
        <React.Fragment>
        <input type='button' value={'refresh'} onClick={refresh} />
        <SearchBar onChange={processSearchText}/>
        <div className='counters'>
            <div className='active-item'>{counters.active}</div>
            <div className='inactive-item'>{counters.inactive}</div>
            <div className='protected-item'>{counters.protected}</div>
        </div>
        <div className='App'>
            {
                sites.map((val, i) => {
                    const item = items[val];
                    return <Item
                        key={i}
                        name={val}
                        alive={item.alive}
                        reason={item.reason}
                        time={item.time}
                        protocol={item.protocol}
                        ip={item.address}
                        ports={item.portsMap}
                    />
                })
            }
        </div>
        </React.Fragment>
    );
}

export default List;
