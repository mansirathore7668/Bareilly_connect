import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { slugify, titleize } from "../utils/directory";

function Categories() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await api.get("/businesses", { params: { sort: "rating-desc" } });
        if (active && response.data?.success) {
          setBusinesses(response.data.businesses || []);
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
  }, []);

  const categoryCards = useMemo(() => {
    const map = new Map();

    businesses.forEach((business) => {
      const key = business.category || "Other";
      const current = map.get(key) || {
        name: key,
        count: 0,
        topRating: 0,
        image: business.image,
      };

      current.count += 1;
      current.topRating = Math.max(current.topRating, Number(business.ratingAverage || 0));
      if (!current.image && business.image) {
        current.image = business.image;
      }
      map.set(key, current);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [businesses]);

  return (
    <section className="container py-5">
      <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-4 gap-3">
        <div>
          <span className="ai-kicker">Browse by category</span>
          <h1 className="mt-3 mb-2">Explore local categories in Bareilly</h1>
          <p className="text-muted mb-0">
            Find restaurants, medical shops, cafes, salons, fitness centers, and more.
          </p>
        </div>
        <Link className="btn btn-outline-primary" to="/business">
          View all businesses
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      ) : (
        <div className="row g-4">
          {categoryCards.map((category) => {
            const slug = slugify(category.name);

            return (
              <div className="col-md-6 col-lg-4" key={category.name}>
                <Link to={`/category/${slug}`} className="text-decoration-none">
                  <div className="card directory-category-card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div className="ratio ratio-4x3 bg-light">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">No image available</div>
                      )}
                    </div>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h4 className="mb-0 text-dark">{titleize(category.name)}</h4>
                        <span className="badge bg-primary-soft text-primary">{category.count}</span>
                      </div>
                      <p className="text-muted mb-0">
                        Best {titleize(category.name)} in Bareilly with trusted listings and reviews.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Categories;
