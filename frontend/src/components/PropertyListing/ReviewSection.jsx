import {
  Wifi,
  Layers,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  Calendar,
} from "lucide-react";

const ReviewSection = ({ formData }) => {
  const amenitiesIcons = {
    Wifi: <Wifi size={16} />,
    Balcony: <Layers size={16} />,
    Parking: <MapPin size={16} />,
    Pool: <Layers size={16} />,
    Gym: <Layers size={16} />,
    "Air Conditioning": <Layers size={16} />,
    "CCTV Surveillance": <Layers size={16} />,
    "Solar Power": <Layers size={16} />,
    "Rooftop Access": <Layers size={16} />,
    Garden: <Layers size={16} />,
    Elevator: <Layers size={16} />,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Review Your Listing
      </h2>
      <p className="text-gray-600">
        Please review all the details before submitting
      </p>

      {/* Property Images */}
      {formData.imageUrls.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Images</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {formData.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Details - Full Width */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
          <Home size={16} /> Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <DetailItem label="Type" value={formData.listingType} />
            <DetailItem label="Purpose" value={formData.rentOrSale} />
            <DetailItem label="Title" value={formData.title} />
          </div>
          <DetailItem
            label="Description"
            value={formData.description}
            isLongText
            fullWidth
          />
        </div>
      </div>

      {/* Pricing & Size - Below Basic Details */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
          <DollarSign size={16} /> Pricing & Size
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem
            label="Price"
            value={`Rs ${formData.price.toLocaleString()}`}
          />
          <DetailItem
            label="Bedrooms"
            value={formData.bedrooms}
            icon={<Bed size={16} />}
          />
          <DetailItem
            label="Bathrooms"
            value={formData.bathrooms}
            icon={<Bath size={16} />}
          />
          <DetailItem
            label="Area"
            value={`${formData.area} sqft`}
            icon={<Ruler size={16} />}
          />
          <DetailItem
            label="Year Built"
            value={formData.yearBuilt || "-"}
            icon={<Calendar size={16} />}
          />
          <DetailItem label="Property Type" value={formData.propertyType} />
        </div>
      </div>

      {/* Location */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
          <MapPin size={16} /> Location
        </h3>
        <div className="space-y-3">
          <DetailItem
            label="Address"
            value={Object.values(formData.address).filter(Boolean).join(", ")}
          />
          <DetailItem
            label="Coordinates"
            value={`${formData.location.coordinates[1]?.toFixed(4) || 0}, ${
              formData.location.coordinates[0]?.toFixed(4) || 0
            }`}
          />
          {formData.nearbyAmenities && (
            <DetailItem
              label="Nearby Amenities"
              value={formData.nearbyAmenities}
              isLongText
            />
          )}
        </div>
      </div>

      {/* Amenities */}
      {formData.amenities.length > 0 && (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-3">
            {formData.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm"
              >
                {amenitiesIcons[amenity] || <Layers size={16} />}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced DetailItem component
const DetailItem = ({
  label,
  value,
  icon,
  isLongText = false,
  fullWidth = false,
}) => {
  if (isLongText) {
    return (
      <div
        className={`flex flex-col gap-1 ${fullWidth ? "md:col-span-2" : ""}`}
      >
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="flex items-start gap-1">
          {icon && <span className="text-gray-400 mt-0.5">{icon}</span>}
          <p className="text-gray-900 text-sm whitespace-pre-line break-words">
            {value || "-"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-500 text-sm w-24 flex-shrink-0">{label}</div>
      <div className="flex items-center gap-1 text-gray-900 text-sm">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>{value || "-"}</span>
      </div>
    </div>
  );
};

export default ReviewSection;
