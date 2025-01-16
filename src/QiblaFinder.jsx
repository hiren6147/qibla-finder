import { useState, useEffect } from "react";
import { getGreatCircleBearing } from "geolib";

const QiblaFinder = () => {
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

  // Determine if the user is facing Mecca (±5° tolerance)
  useEffect(() => {
    const tolerance = 5; // Degrees
    const isFacing = Math.abs(adjustedQiblaDirection) <= tolerance;
    setIsFacingMecca(isFacing);
  }, [adjustedQiblaDirection]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Qibla Finder</h1>
      {/* Message */}
      <p>Qibla Direction: {adjustedQiblaDirection.toFixed(2)}°</p>
      {isFacingMecca ? (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ You are now facing Mecca!
        </p>
      ) : (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ❌ Rotate your device to face Mecca.
        </p>
      )}
      {userLocation ? (
        <div
          style={{
            position: "relative",
            width: "300px",
            height: "300px",
            margin: "0 auto",
          }}
        >
          {/* Fixed arrow */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              width: "0",
              height: "0",
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "20px solid black",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
          ></div>

          {/* Rotating compass */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: `url('https://as1.ftcdn.net/v2/jpg/00/76/15/10/1000_F_76151024_I1mNaznj6ocIRyF8jFVLPxwC0H0ii82r.jpg') no-repeat center/contain`,
              transform: `rotate(${-deviceOrientation}deg)`,
            }}
          >
            {/* Kaaba Icon */}
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "50%",
                transform: `translateX(-50%) rotate(${adjustedQiblaDirection}deg)`,
              }}
            >
              <div
                style={{ width: "30px", height: "30px", background: "black" }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
  );
};

export default QiblaFinder;
