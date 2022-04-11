import React, {useState} from "react";

const SimpleSpoiler = ({children, caption}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flxc">
            <div className="flxr jsb ac">
                <b>{caption}</b>
                <input
                    type='button'
                    className={`btn icon-btn ${expanded ? 'bt-expand-up' : 'bt-expand-down'}`}
                    onClick={() => setExpanded(!expanded)}
                />
            </div>
            <span className="port-list long-text">
                {
                    expanded
                        ? children
                        : null
                }
            </span>
        </div>
    )
}

export default SimpleSpoiler;
