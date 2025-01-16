import { useState, useEffect } from "react";
import { getGreatCircleBearing } from "geolib";
import "./QiblaFinderCopy.css";

const QiblaFinderCopy = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [isFacingMecca, setIsFacingMecca] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        const kaabaLocation = { latitude: 21.4225, longitude: 39.8262 };
        const direction = getGreatCircleBearing(
          { latitude, longitude },
          kaabaLocation
        );
        setQiblaDirection(direction);
      },
      (error) => {
        console.error("Error fetching location:", error);
        alert("Please enable location services to use the Qibla Finder.");
      }
    );
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== "granted") {
            alert("Permission to access device orientation was denied.");
          }
        } catch (error) {
          console.error(
            "Error requesting device orientation permission:",
            error
          );
        }
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const handleOrientation = (event) => {
      let compassHeading = null;

      if (event.webkitCompassHeading) {
        compassHeading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        compassHeading = 360 - event.alpha; // Adjust for Android
      }

      if (compassHeading !== null) {
        setDeviceOrientation(compassHeading);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true
      );
    } else {
      console.error("Device orientation sensor not available.");
    }

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true
      );
    };
  }, []);

  const adjustedQiblaDirection =
    (qiblaDirection - deviceOrientation + 360) % 360;

  useEffect(() => {
    const tolerance = 5;
    const isFacing = Math.abs(adjustedQiblaDirection) <= tolerance;
    setIsFacingMecca(isFacing);
  }, [adjustedQiblaDirection]);

  return (
    <div className="qibla-container">
      <h1>Qibla Finder</h1>
      <p>Qibla Direction: {adjustedQiblaDirection.toFixed(2)}°</p>
      {isFacingMecca ? (
        <p className="facing-message">✅ You are now facing Mecca!</p>
      ) : (
        <p className="not-facing-message">
          ❌ Rotate your device to face Mecca.
        </p>
      )}

      {userLocation ? (
        <div className="compass-wrapper">
          <div className="compass">
            <div
              className="compass-needle"
              style={{ transform: `rotate(${-deviceOrientation}deg)` }}
            />

            <div
              className="kaaba-icon"
              style={{
                transform: `rotate(${adjustedQiblaDirection}deg)`,
              }}
            >
              <div className="kaaba-square"></div>
            </div>

            {/* Direction Indicators */}
            <div className="direction-indicator north">N</div>
            <div className="direction-indicator south">S</div>
            <div className="direction-indicator east">E</div>
            <div className="direction-indicator west">W</div>
          </div>
          <div className="north-indicator">N</div>
        </div>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
  );
};

export default QiblaFinderCopy;
