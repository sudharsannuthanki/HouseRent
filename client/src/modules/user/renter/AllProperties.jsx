import { useEffect, useRef, useState } from "react";
import { getProperties } from "../../../api";
import AllPropertiesCards from "../AllPropertiesCards";

const initialFilters = {
  search: "",
  city: "",
  listingType: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  sort: "newest",
};

function AllProperties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const debounceRef = useRef(null);

  function buildQuery(currentFilters) {
    const params = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  function loadProperties(currentFilters) {
    setIsLoading(true);
    getProperties(buildQuery(currentFilters))
      .then(setProperties)
      .finally(() => setIsLoading(false));
  }

  // Initial load
  useEffect(() => {
    loadProperties(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced live search whenever filters change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadProperties(filters), 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters(initialFilters);
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && !(key === "sort" && value === "newest")
  ).length;

  return (
    <div className="container">
      <h1>Browse Properties</h1>

      <div className="search-panel glass-card">
        <div className="search-row">
          <div className="search-field search-field-wide">
            <span className="search-icon" aria-hidden>&#128269;</span>
            <input
              name="search"
              placeholder="Search by title, city, or description..."
              value={filters.search}
              onChange={updateFilter}
            />
          </div>

          <div className="search-field">
            <select name="listingType" value={filters.listingType} onChange={updateFilter}>
              <option value="">Rent or Sale</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>

          <div className="search-field">
            <select name="propertyType" value={filters.propertyType} onChange={updateFilter}>
              <option value="">Any property type</option>
              <option value="Apartment">Apartment</option>
              <option value="Independent House">Independent House</option>
              <option value="Villa">Villa</option>
              <option value="Studio">Studio</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div className="search-field">
            <select name="sort" value={filters.sort} onChange={updateFilter}>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="search-row search-row-secondary">
          <div className="search-field">
            <label>City</label>
            <input name="city" placeholder="Any city" value={filters.city} onChange={updateFilter} />
          </div>
          <div className="search-field">
            <label>Min price</label>
            <input type="number" name="minPrice" min="0" placeholder="0" value={filters.minPrice} onChange={updateFilter} />
          </div>
          <div className="search-field">
            <label>Max price</label>
            <input type="number" name="maxPrice" min="0" placeholder="Any" value={filters.maxPrice} onChange={updateFilter} />
          </div>
          <div className="search-field">
            <label>Min bedrooms</label>
            <select name="bedrooms" value={filters.bedrooms} onChange={updateFilter}>
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button type="button" className="btn btn-secondary search-clear-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="search-results-meta">
        {isLoading ? "Searching..." : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} found`}
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <p className="empty-state">No properties match your search. Try widening your filters.</p>
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

export default AllProperties;
