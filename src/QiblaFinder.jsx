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
    let timeout;

    const normalizeAngle = (angle) => {
      if (angle < 0) return angle + 360;
      return angle % 360;
    };

    const handleOrientation = (event) => {
      let { alpha } = event;
      if (alpha !== null) {
        alpha = normalizeAngle(alpha);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setDeviceOrientation(alpha);
        }, 100); // Debounce interval
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearTimeout(timeout);
    };
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
