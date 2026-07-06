import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProperty } from "../../../api";
import { formatINRShort } from "../../../utils/formatCurrency";
import Toast from "../../common/Toast";

const initialForm = {
  title: "", description: "", street: "", city: "", state: "", pincode: "",
  listingType: "rent", propertyType: "Apartment", price: "", bedrooms: "", bathrooms: "", area: "", amenities: "",
};

function AddProperty() {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      images.forEach((file) => formData.append("images", file));

      await addProperty(formData);
      navigate("/owner/properties");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h1>Add Property</h1>
      <div className="card">
        <Toast message={error} type="error" />

        <form onSubmit={handleSubmit}>
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
          <div className="form-row highlight-row">
            <label>{form.listingType === "rent" ? "Monthly rent" : "Sale price"} (&#8377; INR)</label>
            <input type="number" name="price" required value={form.price} onChange={updateForm} />
            {form.price ? <p className="hint">That's {formatINRShort(form.price)}</p> : null}
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
            <label>Images</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
          </div>

          <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
            {isSubmitting ? "Publishing..." : "Publish Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;
