import React, {useState} from "react";

const SearchBar = ({onSubmit, onChange}) => {
    const [text, setText] = useState('');

    const setValue = val => {
        setText(val);
        onChange(val);
    }

    return (
        <div className='flxr search-bar'>
            <label>Search</label>
            <input type='text' value={text} onChange={e => {
                const { value } = e.target;
                setValue(value);
            }}/>
            {
                onSubmit ? <input type='button' value='search' onClick={() => onSubmit(text)}/> : null
            }
            <input type="button" className="btn icon-btn bt-cross" onClick={() => setValue("")}/>
        </div>
    );
};

export default SearchBar;