import React from "react";
import ExpandableList from "./ExpandableList";
import SimpleSpoiler from "./SimpleSpoiler";

const SiteCard = ({protocol, name, alive, reason, time, addressList, ports}) => {
    let className;

    const v4 = addressList ? addressList[4] : [];
    const v6 = addressList ? addressList[6] : [];
    const hasIps = v4.length || v6.length;

    if(reason === 'loading') className = 'loading-item';
    else {
        className = alive
            ? 'active'
            : reason && (['protected', 'protected?', 'ssl'].includes(reason))
                ? 'protected'
                : 'inactive';
    }
    return (
        <div className={`flxc jsb item ${className} `}>
            <div className='flxr jsb ac line'>
                <a href={`${protocol}://${name}`} target='_blank' rel='noreferrer'>
                    <span className='long-text b'>{name}</span>
                </a>
                <div className="flxr jsb ac" style={{width: '50px'}}>
                    <input type='button' className='btn icon-btn bt-copy' onClick={() => navigator.clipboard.writeText(name)}/>
                    <a
                        href={'data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify({
                            host: `${protocol}://${name}`,
                            v4, v6, ports
                        }))}
                        download={`${name}.json`}
                        style={{width: '25px', height: '25px'}}
                    >
                        <input
                            type='button'
                            className='btn icon-btn bt-download'
                            style={{width: '30px', height: '30px', margin: 0}}
                        />
                    </a>
                </div>
            </div>
            {hasIps ? '' : 'Ip not resolved'}
            {
                v4.length ? <ExpandableList list={v4} caption="IPv4"/> : null
            }
            {
                v6.length ? <ExpandableList list={v6} caption="IPv6"/> : null
            }
            <SimpleSpoiler caption="Open ports:">
                {` ${ports && ports.length ? ports.join(',') : hasIps && !ports ? 'loading...' : 'none'}`}
            </SimpleSpoiler>
            {reason ? <span>Reason: {reason}</span> : null}
            {time ? <span>Response time: {time} ms</span> : null}
        </div>
    );
}

export default SiteCard;
