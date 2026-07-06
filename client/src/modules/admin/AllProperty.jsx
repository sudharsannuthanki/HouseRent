import { useEffect, useState } from "react";
import { getAdminProperties, requestPropertyRemoval } from "../../api";
import AllPropertiesCards from "../user/AllPropertiesCards";
import Toast from "../common/Toast";

function AllProperty() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function loadProperties() {
    setIsLoading(true);
    getAdminProperties().then(setProperties).finally(() => setIsLoading(false));
  }

  useEffect(() => { loadProperties(); }, []);

  async function handleRequestRemoval(property) {
    const reason = window.prompt(
      `Why should "${property.title}" be taken down? The owner will see this reason and must consent before it's removed.`
    );
    if (!reason || !reason.trim()) return;

    try {
      setError("");
      setSuccess("");
      await requestPropertyRemoval(property._id, reason.trim());
      setSuccess("Removal request sent. The listing stays live until the owner responds.");
      loadProperties();
    } catch (err) {
      setError(err.message);
    }
  }

  function removalBadge(property) {
    const status = property.removalRequest?.status;
    if (!status || status === "none") return null;
    const labels = {
      pending: "Removal pending owner consent",
      approved: "Owner consented - removed",
      declined: "Owner declined removal",
    };
    const classes = { pending: "pending", approved: "rejected", declined: "cancelled" };
    return <span className={`badge ${classes[status]}`} style={{ marginRight: 8 }}>{labels[status]}</span>;
  }

  return (
    <div className="container">
      <h1>All Properties</h1>
      <Toast message={error} type="error" />
      <Toast message={success} type="success" />

      {isLoading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <p className="empty-state">No properties yet.</p>
      ) : (
        <div className="grid">
          {properties.map((property) => (
            <AllPropertiesCards
              key={property._id}
              property={property}
              actions={
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Owner: {property.owner?.name}</span>
                  <div>{removalBadge(property)}</div>
                  {property.status !== "removed" && property.removalRequest?.status !== "pending" && (
                    <button className="btn btn-danger" onClick={() => handleRequestRemoval(property)}>
                      Request Removal
                    </button>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AllProperty;
