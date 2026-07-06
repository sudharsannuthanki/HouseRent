import { useEffect, useState } from "react";
import { getAdminBookings } from "../../api";

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminBookings().then(setBookings).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container">
      <h1>All Bookings</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="empty-state">No bookings yet.</p>
      ) : (
        <table className="card" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: 8 }}>Property</th>
              <th style={{ padding: 8 }}>Renter</th>
              <th style={{ padding: 8 }}>Type</th>
              <th style={{ padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{booking.property?.title}</td>
                <td style={{ padding: 8 }}>{booking.user?.name}</td>
                <td style={{ padding: 8 }}>{booking.type}</td>
                <td style={{ padding: 8 }}><span className={`badge ${booking.status}`}>{booking.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllBookings;
