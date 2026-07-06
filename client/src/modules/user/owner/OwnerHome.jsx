import { Link } from "react-router-dom";

function OwnerHome() {
  return (
    <div className="container">
      <h1>Owner Dashboard</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/owner/properties/new" className="btn">Add Property</Link>
        <Link to="/owner/properties" className="btn btn-secondary">My Properties</Link>
        <Link to="/owner/bookings" className="btn btn-secondary">Booking Requests</Link>
      </div>
    </div>
  );
}

export default OwnerHome;
