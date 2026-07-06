import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPropertyById, createBooking } from "../../api";
import { getUser } from "../../auth";
import { formatINR } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/imageUrl";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({ message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    getPropertyById(id)
      .then(setProperty)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    setImageIndex(0);
  }, [id]);

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleBook(event) {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await createBooking({ propertyId: id, ...form });
      setSuccess("Request sent! The owner will approve or reject it soon.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <p className="container">Loading...</p>;
  if (!property) return <p className="container empty-state">Property not found.</p>;

  return (
    <div className="container" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
      <div>
        {property.images?.[imageIndex] ? (
          <img
            src={getImageUrl(property.images[imageIndex])}
            alt={property.title}
            style={{ width: "100%", borderRadius: 8, maxHeight: 360, objectFit: "cover" }}
            onError={() => setImageIndex((current) => current + 1)}
          />
        ) : (
          <div className="property-detail-image-fallback" />
        )}
        <div className="card" style={{ marginTop: 16 }}>
          <h1 style={{ marginBottom: 8 }}>{property.title}</h1>
          <p style={{ color: "var(--muted)", margin: "0 0 10px" }}>{property.street}, {property.city}, {property.state} - {property.pincode}</p>
          <p style={{ margin: "0 0 10px" }}>{property.bedrooms || 0} bed &middot; {property.bathrooms || 0} bath</p>
          <p style={{ margin: "0 0 10px" }}>{property.description}</p>
          {property.amenities?.length > 0 && (
            <p style={{ margin: 0 }}>Amenities: {property.amenities.join(", ")}</p>
          )}
        </div>
      </div>

      <div className="card" style={{ alignSelf: "start" }}>
        <p className="price">{formatINR(property.price)}{property.listingType === "rent" ? " / month" : ""}</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Listed by {property.owner?.name}</p>

        {error && <p className="status error">{error}</p>}
        {success && <p className="status success">{success}</p>}

        {!success && (
          <form onSubmit={handleBook}>
            <div className="form-row">
              <label>Message (optional)</label>
              <textarea name="message" rows="3" value={form.message} onChange={updateForm} />
            </div>
            <button className="btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : property.listingType === "rent" ? "Request to Book" : "Request to Buy"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PropertyDetails;
