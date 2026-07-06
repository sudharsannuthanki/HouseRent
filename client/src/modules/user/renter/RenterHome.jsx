import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../../api";
import PageHeaderCard from "../../../components/PageHeaderCard";
import Toast from "../../common/Toast";

function RenterHome() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function loadBookings() {
    setIsLoading(true);
    getMyBookings().then(setBookings).catch((err) => setError(err.message)).finally(() => setIsLoading(false));
  }

  useEffect(() => { loadBookings(); }, []);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <PageHeaderCard
        title="My Bookings"
        subtitle="Track your booking requests and messages with owners"
        onRefresh={loadBookings}
      />

      <div style={{ marginBottom: 16 }}>
        <Link to="/renter/properties" className="btn">Browse Properties</Link>
      </div>

      <Toast message={error} type="error" />

      {isLoading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="empty-state">You haven't made any booking requests yet.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking._id} className="card" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Link to={`/properties/${booking.property?._id}`}><strong>{booking.property?.title}</strong></Link>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
                {booking.type === "rent" ? "Rental request" : "Purchase request"} &middot; sent{" "}
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className={`badge ${booking.status}`}>{booking.status}</span>
              <Link to={`/chat/${booking._id}`} className="btn btn-secondary">Chat</Link>
              {(booking.status === "pending" || booking.status === "approved") && (
                <button className="btn btn-secondary" onClick={() => handleCancel(booking._id)}>Cancel</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default RenterHome;
