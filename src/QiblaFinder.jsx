import { useState, useEffect } from "react";
import Compass from "react-wind-compass";
import { getGreatCircleBearing } from "geolib";

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
    let timeout;

    const handleOrientation = (event) => {
      const { alpha } = event;
      console.log("alpha--", alpha);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setDeviceOrientation(alpha);
      }, 100); // Debounce interval (ms)
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      alert("Device orientation is not supported on this device/browser.");
    }
  }, []);

  const adjustedQiblaDirection = qiblaDirection - deviceOrientation;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Qibla Finder</h1>
      {userLocation ? (
        <div>
          <p>
            Your Location: {userLocation.latitude}, {userLocation.longitude}
          </p>
          <Compass
            direction={adjustedQiblaDirection}
            size={200}
            compassColor="gold"
            needleColor="red"
          />
          <p>Qibla Direction: {adjustedQiblaDirection.toFixed(2)}°</p>
        </div>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
  );
};

export default QiblaFinder;
