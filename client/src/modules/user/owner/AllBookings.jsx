import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerBookings, updateBookingStatus } from "../../../api";
import PageHeaderCard from "../../../components/PageHeaderCard";
import Toast from "../../common/Toast";

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function loadBookings() {
    setIsLoading(true);
    getOwnerBookings().then(setBookings).finally(() => setIsLoading(false));
  }

  useEffect(() => { loadBookings(); }, []);

  async function handleAction(id, status) {
    try {
      await updateBookingStatus(id, status);
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <PageHeaderCard
        title="Booking Requests"
        subtitle="Review and respond to renter/buyer requests on your properties"
        onRefresh={loadBookings}
      />
      <Toast message={error} type="error" />

      {isLoading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="empty-state">No booking requests yet.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking._id} className="card" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{booking.property?.title}</strong>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
                Requested by {booking.user?.name} ({booking.user?.email})
              </p>
              {booking.message && <p style={{ fontSize: 13, fontStyle: "italic" }}>"{booking.message}"</p>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={`badge ${booking.status}`}>{booking.status}</span>
              <Link to={`/chat/${booking._id}`} className="btn btn-secondary">Chat</Link>
              {booking.status === "pending" && (
                <>
                  <button className="btn" onClick={() => handleAction(booking._id, "approved")}>Approve</button>
                  <button className="btn btn-danger" onClick={() => handleAction(booking._id, "rejected")}>Reject</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AllBookings;
