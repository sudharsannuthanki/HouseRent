import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProperties, deleteProperty, respondToRemovalRequest, updateProperty } from "../../../api";
import AllPropertiesCards from "../AllPropertiesCards";
import HeroBanner from "../../../components/HeroBanner";
import { IconPlus } from "../../../components/Icons";
import Toast from "../../common/Toast";

function AllProperties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function loadProperties() {
    setIsLoading(true);
    getMyProperties().then(setProperties).finally(() => setIsLoading(false));
  }

  useEffect(() => { loadProperties(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this property?")) return;
    try {
      await deleteProperty(id);
      loadProperties();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemovalResponse(id, consent) {
    if (consent && !window.confirm("This will take your listing off the app. Continue?")) return;
    try {
      setError("");
      setSuccess("");
      await respondToRemovalRequest(id, consent);
      setSuccess(consent ? "Listing removed as requested." : "You declined the removal request.");
      loadProperties();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddAgain(id) {
    try {
      setError("");
      setSuccess("");
      const formData = new FormData();
      formData.append("status", "active");
      await updateProperty(id, formData);
      setSuccess("Listing added again.");
      loadProperties();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <HeroBanner
        eyebrow="Landlord Command Hub"
        title="List, Manage, and Monitor Your Properties"
        subtitle="List rentals or sale properties, edit your price anytime, and review incoming booking requests."
        action={
          <Link to="/owner/properties/new" className="btn hero-btn">
            <IconPlus size={15} /> Add New Property Listing
          </Link>
        }
      />

      <Toast message={error} type="error" />
      <Toast message={success} type="success" />

      {isLoading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <p className="empty-state">You haven't listed any properties yet.</p>
      ) : (
        <div className="grid">
          {properties.map((property) => (
            <AllPropertiesCards
              key={property._id}
              property={property}
              actions={
                <div style={{ width: "100%" }}>
                  {property.removalRequest?.status === "pending" && (
                    <div className="status error" style={{ marginBottom: 8 }}>
                      <strong>Admin requested removal:</strong> {property.removalRequest.reason}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn btn-danger" onClick={() => handleRemovalResponse(property._id, true)}>
                          Consent &amp; Remove
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleRemovalResponse(property._id, false)}>
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                  {property.status === "removed" && (
                    <span className="badge rejected" style={{ marginBottom: 8, display: "inline-block" }}>Removed</span>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    {property.status === "removed" && (
                      <button className="btn" onClick={() => handleAddAgain(property._id)}>Add Again</button>
                    )}
                    <Link to={`/owner/properties/${property._id}/edit`} className="btn btn-secondary">Edit</Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(property._id)}>Delete</button>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AllProperties;
