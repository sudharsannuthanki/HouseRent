import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getMyPropertyById, updateProperty } from "../../../api";
import { formatINRShort } from "../../../utils/formatCurrency";
import Toast from "../../common/Toast";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getMyPropertyById(id)
      .then((property) =>
        setForm({
          title: property.title,
          description: property.description,
          street: property.street,
          city: property.city,
          state: property.state,
          pincode: property.pincode,
          listingType: property.listingType,
          propertyType: property.propertyType || "Apartment",
          price: property.price,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || "",
          amenities: (property.amenities || []).join(", "),
          status: property.status,
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      setSuccess("");
      setIsSubmitting(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      newImages.forEach((file) => formData.append("images", file));

      await updateProperty(id, formData);
      setSuccess("Listing updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <p className="container">Loading...</p>;
  if (!form) return <p className="container empty-state">{error || "Property not found."}</p>;

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Edit Property</h1>
        <Link to="/owner/properties" className="btn btn-secondary">Back</Link>
      </div>

      <div className="glass-card">
        <Toast message={error} type="error" />
        <Toast message={success} type="success" />

        <form onSubmit={handleSubmit}>
          {/* Price / rent front and center so it's the quickest thing to change */}
          <div className="form-row highlight-row">
            <label>{form.listingType === "rent" ? "Monthly rent" : "Sale price"} (&#8377; INR)</label>
            <input type="number" name="price" min="0" required value={form.price} onChange={updateForm} />
            {form.price ? <p className="hint">That's {formatINRShort(form.price)}</p> : null}
          </div>

          <div className="form-row">
            <label>Title</label>
            <input name="title" required value={form.title} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea name="description" rows="3" required value={form.description} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Street</label>
            <input name="street" required value={form.street} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>City</label>
            <input name="city" required value={form.city} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>State</label>
            <input name="state" required value={form.state} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Pincode</label>
            <input name="pincode" required value={form.pincode} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Listing type</label>
            <select name="listingType" value={form.listingType} onChange={updateForm}>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>
          <div className="form-row">
            <label>Property type</label>
            <select name="propertyType" value={form.propertyType} onChange={updateForm}>
              <option value="Apartment">Apartment</option>
              <option value="Independent House">Independent House</option>
              <option value="Villa">Villa</option>
              <option value="Studio">Studio</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div className="form-row">
            <label>Bedrooms</label>
            <input type="number" name="bedrooms" value={form.bedrooms} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Bathrooms</label>
            <input type="number" name="bathrooms" value={form.bathrooms} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Area (sq. ft.)</label>
            <input type="number" name="area" min="0" value={form.area} onChange={updateForm} />
          </div>
          <div className="form-row">
            <label>Amenities (comma separated)</label>
            <input name="amenities" value={form.amenities} onChange={updateForm} placeholder="Parking, Lift" />
          </div>
          <div className="form-row">
            <label>Listing status</label>
            <select name="status" value={form.status} onChange={updateForm}>
              <option value="active">Active (visible to everyone)</option>
              <option value="inactive">Inactive (hidden from search)</option>
            </select>
          </div>
          <div className="form-row">
            <label>Add more images (optional)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setNewImages(Array.from(e.target.files))} />
          </div>

          <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;
