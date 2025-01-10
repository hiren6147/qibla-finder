import { useState, useEffect } from "react";
import { getGreatCircleBearing } from "geolib";
import "./QiblaFinder.css"; // Include compass styles

const QiblaFinder = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [deviceOrientation, setDeviceOrientation] = useState(0);

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
      const { alpha } = event;
      if (alpha !== null) {
        setDeviceOrientation(alpha);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const adjustedQiblaDirection =
    (qiblaDirection - deviceOrientation + 360) % 360;

  return (
    <div className="qibla-finder">
      <h1>Qibla Finder</h1>
      {userLocation ? (
        <div className="compass-container">
          <div
            className="compass"
            style={{
              transform: `rotate(${-deviceOrientation}deg)`,
            }}
          >
            <div
              className="needle"
              style={{
                transform: `rotate(${adjustedQiblaDirection}deg)`,
              }}
            ></div>
          </div>
          <p>
            Rotate your phone to align with the Qibla direction:{" "}
            {adjustedQiblaDirection.toFixed(2)}°
          </p>
          {Math.abs(adjustedQiblaDirection) < 5 && (
            <p className="success-message">You are now facing Mecca!</p>
          )}
        </div>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
  );
};

export default QiblaFinder;
