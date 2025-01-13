import { useState, useEffect } from "react";
import "./Compass.css";
import Compass from "./Compass";

function QiblaFinderNew() {
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [facingMecca, setFacingMecca] = useState(false);

  // Calculate Qibla direction based on user location and compass heading
  const calculateQiblaDirection = (alpha, latitude, longitude) => {
    // Convert degrees to radians
    const lat1 = (latitude * Math.PI) / 180;
    const lon1 = (longitude * Math.PI) / 180;
    const lat2 = (21.4225 * Math.PI) / 180; // Kaaba latitude
    const lon2 = (39.8262 * Math.PI) / 180; // Kaaba longitude

    // Calculate the angle
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    let qiblaDirection = (Math.atan2(y, x) * 180) / Math.PI;

    // Adjust for compass heading (alpha) and normalize to 0-360 degrees
    qiblaDirection = (qiblaDirection - alpha + 360) % 360;

    return qiblaDirection;
  };

  // Handle compass readings
  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.webkitCompassHeading) {
        // iOS
        setQiblaDirection(
          calculateQiblaDirection(
            event.webkitCompassHeading,
            userLocation.latitude,
            userLocation.longitude
          )
        );
      } else if (event.alpha !== null) {
        // Android
        setQiblaDirection(
          calculateQiblaDirection(
            event.alpha,
            userLocation.latitude,
            userLocation.longitude
          )
        );
      }
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation);
    return () =>
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation
      );
  }, [userLocation]);

  useEffect(() => {
    const tolerance = 5; // Degrees of tolerance
    if (qiblaDirection >= 360 - tolerance || qiblaDirection <= tolerance) {
      setFacingMecca(true);
    } else {
      setFacingMecca(false);
    }
  }, [qiblaDirection]);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        // Consider providing a fallback or error message to the user
      }
    );
  }, []);

  return (
    <div>
      {/* Display user location information */}
      {userLocation && (
        <div>
          <p>Latitude: {userLocation.latitude}</p>
          <p>Longitude: {userLocation.longitude}</p>
        </div>
      )}
      {/* Display message when facing Mecca */}
      {facingMecca && (
        <div className="facing-mecca-message">You are facing the Qibla!</div>
      )}
      <Compass direction={qiblaDirection} />
    </div>
  );
}

export default QiblaFinderNew;
