import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import FormInput from "./FormInput";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 27.7103,
  lng: 85.3222,
};

const GoogleMapComponent = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = React.useState(null);

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const address = {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        };

        addressComponents.forEach((component) => {
          if (component.types.includes("route"))
            address.street = component.long_name;
          if (component.types.includes("locality"))
            address.city = component.long_name;
          if (component.types.includes("administrative_area_level_1"))
            address.state = component.long_name;
          if (component.types.includes("postal_code"))
            address.zip = component.long_name;
          if (component.types.includes("country"))
            address.country = component.long_name;
        });

        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <div className="h-80 w-full rounded-lg border border-gray-200 overflow-hidden">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onClick={handleMapClick}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

const LocationStep = ({
  formData,
  errors,
  handleAddressChange,
  handleChange,
}) => {
  const handleLocationSelect = (lat, lng, address) => {
    // Update address fields
    handleAddressChange({
      target: {
        name: "city",
        value: address.city,
      },
    });
    handleAddressChange({
      target: {
        name: "state",
        value: address.state,
      },
    });
    handleAddressChange({
      target: {
        name: "country",
        value: address.country,
      },
    });
    handleAddressChange({
      target: {
        name: "street",
        value: address.street,
      },
    });
    handleAddressChange({
      target: {
        name: "zip",
        value: address.zip,
      },
    });

    // Also need to update the location coordinates in formData
    // Add a new prop to handle location change
    handleChange({
      target: {
        name: "location",
        value: {
          type: "Point",
          coordinates: [lng, lat], // Note: longitude first, latitude second
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Location
        </label>
        <GoogleMapComponent onLocationSelect={handleLocationSelect} />
        {errors.location && (
          <p className="text-sm text-red-500 mt-2">{errors.location}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Street"
          name="street"
          type="text"
          value={formData.address.street}
          onChange={handleAddressChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
        />
        <FormInput
          label="City"
          name="city"
          type="text"
          value={formData.address.city}
          onChange={handleAddressChange}
          error={errors.address?.city}
          required
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
        />
        <FormInput
          label="State"
          name="state"
          type="text"
          value={formData.address.state}
          onChange={handleAddressChange}
          error={errors.address?.state}
          required
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
        />
        <FormInput
          label="ZIP Code"
          name="zip"
          type="text"
          value={formData.address.zip}
          onChange={handleAddressChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
        />
        <FormInput
          label="Country"
          name="country"
          type="text"
          value={formData.address.country}
          onChange={handleAddressChange}
          error={errors.address?.country}
          required
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nearby Amenities
        </label>
        <textarea
          name="nearbyAmenities"
          value={formData.nearbyAmenities}
          onChange={handleChange}
          rows="3"
          placeholder="e.g., Coffee shop 0.5 miles away, bus stop nearby"
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
        />
      </div>
    </div>
  );
};

export default LocationStep;
