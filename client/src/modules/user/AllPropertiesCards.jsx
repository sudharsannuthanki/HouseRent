import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatINRShort } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/imageUrl";
import { IconPin, IconBed, IconBath, IconArea } from "../../components/Icons";

// One property card, reused on the Home page, renter/owner/admin listings.
function AllPropertiesCards({ property, actions }) {
  const isForRent = property.listingType === "rent";
  const [imageIndex, setImageIndex] = useState(0);
  const images = property.images || [];
  const image = images[imageIndex];

  useEffect(() => {
    setImageIndex(0);
  }, [property._id, property.images]);

  return (
    <div className="card property-card">
      <div className="property-card-media">
        <Link className="property-card-media-link" to={`/properties/${property._id}`}>
          {image ? (
            <img
              src={getImageUrl(image)}
              alt={property.title}
              onError={() => setImageIndex((current) => current + 1)}
            />
          ) : (
            <div className="property-card-media-fallback" />
          )}
        </Link>
        <div className="property-card-badges">
          <span className={`pill-badge ${isForRent ? "pill-rent" : "pill-sale"}`}>
            {isForRent ? "For Rent" : "For Sale"}
          </span>
          {property.propertyType && <span className="pill-badge pill-neutral">{property.propertyType}</span>}
        </div>
      </div>

      <h3 style={{ margin: "12px 0 2px" }}>
        <Link to={`/properties/${property._id}`}>{property.title}</Link>
      </h3>
      <p className="price">
        {formatINRShort(property.price)}{isForRent ? " / month" : ""}
      </p>
      <p className="property-card-address">
        <IconPin size={13} /> {property.city}, {property.state}
      </p>

      <div className="property-stats-row">
        <span><IconBed size={13} /> {property.bedrooms || 0} Bed</span>
        <span><IconBath size={13} /> {property.bathrooms || 0} Bath</span>
        {property.area ? <span><IconArea size={13} /> {property.area} sqft</span> : null}
      </div>

      {actions && <div style={{ marginTop: 10, display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

export default AllPropertiesCards;
