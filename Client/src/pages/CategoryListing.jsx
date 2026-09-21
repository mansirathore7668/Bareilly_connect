import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BusinessCard from "../components/BusinessCard";
import api from "../api";
import { slugify, titleize, mapSearchUrl } from "../utils/directory";

function CategoryListing() {
  const { slug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryName = useMemo(() => titleize(slug || ""), [slug]);

  useEffect(() => {
    let active = true;

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/businesses", {
          params: { category: categoryName },
        });

        if (active && response.data?.success) {
          setBusinesses(response.data.businesses || []);
        }
      } catch {
        if (active) {
          setError("Could not load this category right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (categoryName) {
      fetchBusinesses();
    }

    return () => {
      active = false;
    };
  }, [categoryName]);

  const relatedCategories = useMemo(() => {
    const unique = new Set();
    businesses.forEach((business) => {
      if (business.category) {
        unique.add(business.category);
      }
    });
    return Array.from(unique)
      .filter((category) => slugify(category) !== slug)
      .slice(0, 4);
  }, [businesses, slug]);

  return (
    <section className="container py-5">
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small text-muted mb-3">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/categories" className="text-decoration-none">
                Categories
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {categoryName}
            </li>
          </ol>
        </nav>

        <div className="directory-hero card border-0 shadow-sm rounded-5 p-4 p-md-5">
          <span className="ai-kicker">Local Directory</span>
          <h1 className="display-6 fw-bold mt-3 mb-3">
            Best {categoryName} in Bareilly
          </h1>
          <p className="lead text-muted mb-0">
            Explore trusted {categoryName.toLowerCase()} listings with contact details, ratings, reviews,
            and quick action links.
          </p>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <a
          className="btn btn-outline-primary"
          href={mapSearchUrl(`best ${categoryName} in Bareilly`)}
          target="_blank"
          rel="noreferrer"
        >
          Open on Maps
        </a>
        <Link className="btn btn-outline-secondary" to="/ai-search">
          Ask AI about this category
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : businesses.length === 0 ? (
        <div className="alert alert-warning">
          No businesses found in this category yet.
        </div>
      ) : (
        <>
          <div className="row">
            {businesses.map((business) => (
              <div className="col-md-6 col-lg-4 mb-4" key={business._id}>
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
            ))}
          </div>

          <div className="row g-4 mt-2">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h3 className="mb-3">What you can do here</h3>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light">
                        <strong>Call directly</strong>
                        <p className="text-muted mb-0">Open a listing and contact the business quickly.</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light">
                        <strong>Read reviews</strong>
                        <p className="text-muted mb-0">See ratings and feedback before you decide.</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light">
                        <strong>Save favorites</strong>
                        <p className="text-muted mb-0">Keep useful listings handy for later.</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light">
                        <strong>Ask AI</strong>
                        <p className="text-muted mb-0">Use natural language to find the best match faster.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h3 className="mb-3">Related categories</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {relatedCategories.map((related) => (
                      <Link
                        key={related}
                        to={`/category/${slugify(related)}`}
                        className="badge bg-primary-soft text-primary text-decoration-none px-3 py-2"
                      >
                        {related}
                      </Link>
                    ))}
                  </div>
                  <hr className="my-4" />
                  <p className="text-muted mb-0">
                    This page is designed like a local directory listing page, with quick actions and
                    category-based discovery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default CategoryListing;
