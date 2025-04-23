import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

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

export const MapWithAllProperties = ({ markers = [] }) => {
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Use the first marker as the center or fallback to defaultCenter
  const center =
    markers.length > 0
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : defaultCenter;

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
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {selectedMarker.title}
                </h3>
                <button
                  onClick={() => {
                    navigate(`/property/${selectedMarker.listingId}`);
                    setSelectedMarker(null);
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export const GoogleMapComponent = ({ lat, lng }) => {
  const center = {
    lat: lat || defaultCenter.lat,
    lng: lng || defaultCenter.lng,
  };

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
          {lat && lng && <Marker position={center} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapComponent;
