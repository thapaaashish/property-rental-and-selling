import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 27.7103, // 27.7103° N, 85.3222° E kathmandu ko lat long
  lng: 85.3222,
};

const GoogleMapComponent  = () => {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} />
    </LoadScript>
  );
};

export default GoogleMapComponent ;
