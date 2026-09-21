import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BusinessCard from "../components/BusinessCard";
import api from "../api";

function Business() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [sort, setSort] = useState("rating-desc");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const updateParams = (nextSearch, nextCategory) => {
    const params = new URLSearchParams();

    if (nextSearch) params.set("search", nextSearch);
    if (nextCategory) params.set("category", nextCategory);
    if (location) params.set("location", location);

    setSearchParams(params);
    setPage(1);
  };

  useEffect(() => {
    let active = true;

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await api.get("/businesses", {
          params: {
            search,
            category,
            location,
            sort,
            page,
            limit: 12,
          },
        });

        if (active && response.data?.success) {
          setBusinesses(response.data.businesses || []);
          setPagination(response.data.pagination || null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBusinesses();

    return () => {
      active = false;
    };
  }, [search, category, location, sort, page]);

  return (
    <section className="container mt-5 mb-5">
      <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-4 gap-3">
        <div>
          <span className="ai-kicker">Bareilly business list</span>
          <h2 className="mt-3 mb-2">All Businesses</h2>
          <p className="text-muted mb-0">Browse every listing and choose the best fit for your needs.</p>
        </div>
        <div className="text-muted">{businesses.length} business listings</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Search by name, category, or location"
            value={search}
            onChange={(e) => updateParams(e.target.value, category)}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={category} onChange={(e) => updateParams(search, e.target.value)}>
            <option value="">All categories</option>
            <option value="Cafe">Cafe</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Medical">Medical</option>
            <option value="Beauty">Beauty</option>
            <option value="Fitness">Fitness</option>
          </select>
        </div>
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Filter by area"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating-desc">Top rated</option>
            <option value="newest">Newest</option>
            <option value="rating-asc">Rating low to high</option>
          </select>
        </div>
      </div>

      <div className="row">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading" />
            <p className="text-muted">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h3>No businesses found.</h3>
            <p>Try another search or filter.</p>
          </div>
        ) : (
          businesses.map((business) => (
            <div className="col-md-4 mb-4" key={business._id}>
              <BusinessCard
                id={business._id}
                BusinessName={business.name}
                category={business.category}
                Address={business.location}
                Rating={business.ratingAverage}
                Reviews={business.reviewCount || 0}
                image={business.image}
              />
            </div>
          ))
        )}
      </div>

      {!loading && pagination?.pages > 1 && (
        <nav className="d-flex justify-content-center gap-2 mt-3" aria-label="Business pages">
          <button className="btn btn-outline-primary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <span className="align-self-center text-muted">Page {page} of {pagination.pages}</span>
          <button className="btn btn-outline-primary" disabled={page === pagination.pages} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </nav>
      )}
    </section>
  );
}

export default Business;
