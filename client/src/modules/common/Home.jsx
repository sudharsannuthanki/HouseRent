import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../../api";
import AllPropertiesCards from "../user/AllPropertiesCards";

function Home() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProperties()
      .then((data) => setProperties(data.slice(0, 6)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="card" style={{ background: "linear-gradient(135deg, var(--primary-soft), #fff)", border: "1px solid rgba(109,94,248,0.18)", marginBottom: 24 }}>
        <h1 style={{ marginBottom: 6 }}>Find your next home in India</h1>
        <p style={{ color: "var(--muted)", margin: "0 0 14px" }}>
          Rent or buy properties listed directly by owners - no brokers, no hidden documents.
        </p>
        <Link to="/renter/properties" className="btn">Browse Properties</Link>
      </div>

      <h3 style={{ marginBottom: 14 }}>Recently listed</h3>

      {isLoading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <p className="empty-state">No properties listed yet.</p>
      ) : (
        <div className="grid">
          {properties.map((property) => (
            <AllPropertiesCards key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
