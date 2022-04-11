const UpBtn = ({place}) => (
    <button className="btn up-btn bt-expand-up" onClick={() => place.current.scrollIntoView({behavior: "smooth"} )}></button>
)

export default UpBtn;
