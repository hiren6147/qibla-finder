import { useState, useEffect } from "react";
import Compass from "react-wind-compass";
import { getGreatCircleBearing } from "geolib";

const QiblaFinder = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);

  useEffect(() => {
    // Get user location using Geolocation API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        // Calculate Qibla direction
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

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Qibla Finder</h1>
      {userLocation ? (
        <div>
          <p>
            Your Location: {userLocation.latitude}, {userLocation.longitude}
          </p>
          <Compass
            direction={qiblaDirection}
            size={200}
            compassColor="gold"
            needleColor="red"
          />
          <p>Qibla Direction: {qiblaDirection.toFixed(2)}°</p>
        </div>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
  );
};

export default QiblaFinder;
