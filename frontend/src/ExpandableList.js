import React, {useState} from "react";

const ExpandableList = ({caption, list}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className='flxc js'>
            <div className='flxr jsb ac'>
                <b>{`${caption}:`}</b>
                <input type='button' className={`btn icon-btn ${expanded ? 'bt-expand-up' : 'bt-expand-down'}`} onClick={() => setExpanded(!expanded)}/>
            </div>
            {
                expanded ? list.map((val, id) => (
                    <div key={id} className='flxr jsb ac line' style={{marginTop: '5px'}}>
                        <span>{val}</span>
                        <input type='button' className='btn icon-btn bt-copy' onClick={() => navigator.clipboard.writeText(val)}/>
                    </div>
                )) : null
            }
        </div>
    )
};

export default ExpandableList