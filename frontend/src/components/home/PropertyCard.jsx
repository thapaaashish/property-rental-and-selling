import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const formatPrice = (price, priceUnit) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return priceUnit === 'monthly' ? `${formatted}/mo` : formatted;
};

const PropertyCard = ({ property, featured = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Ensure property.images exists and has elements, else fallback to placeholder image
  const images = property?.images || [];
  const imageSrc = images.length > 0 ? images[imageIndex] : '/path/to/placeholder-image.jpg';

  return (
    <div className={`group relative bg-white rounded-xl overflow-hidden`}>
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative overflow-hidden aspect-[4/3]">
          {property?.isNew && (
            <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              New
            </div>
          )}
          <button onClick={handleFavoriteClick} className="absolute top-4 right-4">
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
          </button>
          <img 
            src={imageSrc} 
            alt={property?.title || 'Property Image'} 
            className="w-full h-full object-cover" 
            onLoad={handleImageLoad} 
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold">{property?.title || 'Property Title'}</h3>
          <p className="text-2xl font-bold text-blue-600">{formatPrice(property?.price, property?.priceUnit)}</p>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
