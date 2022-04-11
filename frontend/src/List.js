import './App.css';
import React, {useState} from 'react';
import SearchBar from "./SearchBar";
import SiteCard from "./SiteCard";
import UpBtn from "./UpBtn";
import {Pagination} from "@mui/material";

const ITEM_PER_PAGE = 24;

const List = ({ refresh, items }) => {
    const [searchRegex, setSearchRegex] = useState(null);
    const [page, setPage] = useState(1);

    const processSearchText = val => {
        if(val && val !== '') return setSearchRegex(new RegExp(val, 'gi'));
        setSearchRegex(null);
    }

    let sites = Object.keys(items);
    const counters = {
        active: 0,
        inactive: 0,
        protected: 0,
        total: 0
    }
    if(searchRegex) {
        sites = sites.filter(val => searchRegex.test(val));
    }
    sites = sites
        .map(site => {
            counters.total++;
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
        }).slice((page - 1) * ITEM_PER_PAGE, page * ITEM_PER_PAGE);
    const topRef = React.createRef();

    return (
        <React.Fragment>
            <div ref={topRef}></div>
            <UpBtn place={topRef} />
            <input className={"btn icon-btn bt-refresh"} type='button' onClick={refresh} />
            <SearchBar onChange={processSearchText}/>
            <div className='flxr js ac counters'>
                <div className='active'>{counters.active}</div>
                <div className='inactive'>{counters.inactive}</div>
                <div className='protected'>{counters.protected}</div>
            </div>
            <div className='App'>
                {
                    sites.map((val, i) => {
                        const item = items[val];
                        return <SiteCard
                            key={i}
                            name={val}
                            alive={item.alive}
                            reason={item.reason}
                            time={item.time}
                            protocol={item.protocol}
                            addressList={item.addressList}
                            ports={item.portsMap}
                        />
                    })
                }
            </div>
            <Pagination
                count={Math.ceil(counters.total / ITEM_PER_PAGE)}
                page={page}
                onChange={(e, val) => setPage(val)}
                showFirstButton showLastButton
            />
        </React.Fragment>
    );
}

export default List;
