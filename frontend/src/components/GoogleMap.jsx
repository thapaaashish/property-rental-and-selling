import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Container style for the map
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center coordinates (used as fallback)
const defaultCenter = {
  lat: 27.7103,
  lng: 85.3222,
};

// GoogleMapComponent with lat and lng as props
const GoogleMapComponent = ({ lat, lng }) => {
  // Use the provided lat and lng or fallback to defaultCenter
  const center = {
    lat: lat || defaultCenter.lat,
    lng: lng || defaultCenter.lng,
  };

  // Log the rendering of the map component
  console.log("Rendering map component with center:", center);

  return (
    <div className="map-wrapper" style={{ width: "100%", height: "100%" }}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={19}
          onLoad={(map) => console.log("Map loaded successfully")}
          onError={(e) => console.error("Map error:", e)}
        >
          {/* Display a marker if lat and lng are provided */}
          {lat && lng && <Marker position={center} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export const MapWithAllProperties = ({ markers = [] }) => {
  console.log("Markers:", markers); // Debug the markers prop

  // Use the first marker as the center or fallback to defaultCenter
  const center = markers.length > 0 ? markers[0] : defaultCenter;
  console.log("Map center:", center); // Debug the map center

  return (
    <div className="map-wrapper" style={{ width: "100%", height: "100%" }}>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={(map) => console.log("Map loaded successfully")}
          onError={(e) => console.error("Map error:", e)}
        >
          {/* Display markers for each coordinate pair */}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapComponent;
