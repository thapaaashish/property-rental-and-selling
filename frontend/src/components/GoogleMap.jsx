import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 27.7103,
  lng: 85.3222,
};

const GoogleMapComponent = () => {
  // Add a console log to check if the component is rendering
  console.log("Rendering map component");

  return (
    <div className="map-wrapper" style={{ width: "100%", height: "100%" }}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={(map) => console.log("Map loaded successfully")}
          onError={(e) => console.error("Map error:", e)}
        />
      </LoadScript>
    </div>
  );
};

export default GoogleMapComponent;
