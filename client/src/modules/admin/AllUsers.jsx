import { useEffect, useState } from "react";
import { getAdminUsers, toggleUserStatus } from "../../api";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  function loadUsers() {
    setIsLoading(true);
    getAdminUsers().then(setUsers).finally(() => setIsLoading(false));
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleToggle(id) {
    await toggleUserStatus(id);
    loadUsers();
  }

  return (
    <div className="container">
      <h1>All Users</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="card" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}>{user.name}</td>
                <td style={{ padding: 8 }}>{user.email}</td>
                <td style={{ padding: 8 }}>{user.role}</td>
                <td style={{ padding: 8 }}>
                  <span className={`badge ${user.isActive ? "approved" : "rejected"}`}>
                    {user.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  <button className="btn btn-secondary" onClick={() => handleToggle(user._id)}>
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllUsers;
