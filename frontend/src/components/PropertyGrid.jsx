import PropertyCard from './PropertyCard';

const PropertyGrid = ({ properties, title, subtitle, featured = false }) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              featured={featured && property.isFeatured}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;
