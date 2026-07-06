import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api";

function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => { getAdminStats().then(setStats); }, []);

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {stats && (
        <div className="grid" style={{ marginBottom: 24 }}>
          <div className="card"><strong>{stats.totalUsers}</strong><p>Renters</p></div>
          <div className="card"><strong>{stats.totalOwners}</strong><p>Owners</p></div>
          <div className="card"><strong>{stats.totalProperties}</strong><p>Properties</p></div>
          <div className="card"><strong>{stats.pendingBookings}</strong><p>Pending bookings</p></div>
          <div className="card"><strong>{stats.totalBookings}</strong><p>Total bookings</p></div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/admin/users" className="btn btn-secondary">All Users</Link>
        <Link to="/admin/properties" className="btn btn-secondary">All Properties</Link>
        <Link to="/admin/bookings" className="btn btn-secondary">All Bookings</Link>
      </div>
    </div>
  );
}

export default AdminHome;
