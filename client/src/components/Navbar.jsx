import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, logout } from "../auth";
import { IconBuilding, IconLogout } from "./Icons";

const navTabsByRole = {
  user: [
    { label: "Browse Properties", to: "/renter/properties" },
    { label: "My Bookings", to: "/renter" },
  ],
  owner: [
    { label: "My Properties", to: "/owner/properties" },
    { label: "Booking Requests", to: "/owner/bookings" },
  ],
  admin: [
    { label: "Users", to: "/admin/users" },
    { label: "Properties", to: "/admin/properties" },
    { label: "Bookings", to: "/admin/bookings" },
  ],
};

const roleLabel = { user: "Renter / Buyer", owner: "Property Owner", admin: "Administrator" };

function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const tabs = user ? navTabsByRole[user.role] || [] : [];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon"><IconBuilding size={18} /></span>
          HouseRent India
        </Link>

        {tabs.length > 0 && (
          <nav className="nav-tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={`nav-tab ${location.pathname === tab.to ? "active" : ""}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="navbar-right">
          {user ? (
            <>
              <div className="navbar-user">
                <span className="avatar-circle">{user.name?.[0]?.toUpperCase() || "?"}</span>
                <span className="navbar-user-text">
                  <strong>{user.name}</strong>
                  <span className="navbar-user-role">{roleLabel[user.role] || user.role}</span>
                </span>
              </div>
              <button className="icon-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
                <IconLogout size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-plain-link">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
