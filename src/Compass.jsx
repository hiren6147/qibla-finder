import "./Compass.css";
import PropTypes from "prop-types";

function Compass({ direction }) {
  const compassStyle = {
    transform: `rotate(${direction}deg)`,
  };

  return (
    <div className="compass-container">
      <div className="compass-arrow" style={compassStyle}>
        <div className="arrow-head"></div>
      </div>
      <div className="compass-base">
        <span className="north">N</span>
        <span className="east">E</span>
        <span className="south">S</span>
        <span className="west">W</span>
      </div>
    </div>
  );
}
Compass.propTypes = {
  direction: PropTypes.number.isRequired,
};

export default Compass;
