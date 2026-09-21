import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import BusinessCard from "../components/BusinessCard";
import FeatureCard from "../components/FeatureCard";
import AIQueryPanel from "../components/AIQueryPanel";
import api from "../api";

const directoryCategories = [
  { emoji: "🍽️", label: "Restaurants" },
  { emoji: "☕", label: "Cafe" },
  { emoji: "🏥", label: "Medical" },
  { emoji: "💇", label: "Beauty" },
  { emoji: "🧘", label: "Wellness" },
  { emoji: "🛍️", label: "Retail" },
  { emoji: "🏨", label: "Hospitality" },
  { emoji: "💼", label: "Professional Services" },
  { emoji: "🚗", label: "Automotive" },
  { emoji: "🎓", label: "Education" },
  { emoji: "💻", label: "Technology" },
  { emoji: "🔧", label: "Services & Utilities" },
];

const alphaLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [searchRequestId, setSearchRequestId] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchResultsRef = useRef(null);

  useEffect(() => {
    let active = true;

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/businesses", {
          params: { search: submittedSearch },
        });

        if (active && response.data?.success) {
          setBusinesses(response.data.businesses || []);
        }
      } catch {
        if (active) {
          setError("Could not load businesses right now.");
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
  }, [submittedSearch, searchRequestId]);

  useEffect(() => {
    if (hasSearched && !loading) {
      searchResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hasSearched, loading, searchRequestId]);

  const handleSearch = () => {
    const nextSearch = search.trim();

    if (loading) return;

    setSubmittedSearch(nextSearch);
    setHasSearched(true);
    setSearchRequestId((current) => current + 1);
    setLoading(true);
  };

  const categories = useMemo(() => {
    const map = new Map();

    businesses.forEach((business) => {
      const key = business.category || "Other";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [businesses]);

  return (
    <>
      <Hero
        businesses={businesses}
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        loading={loading}
      />

      {hasSearched && (
        <section ref={searchResultsRef} className="container mt-4 mb-5 search-results-section">
          <div className="search-results-header">
            <div>
              <span className="ai-kicker">Search Results</span>
              <h2 className="mt-3 mb-2">Results for &quot;{submittedSearch}&quot;</h2>
              {!loading && !error && (
                <p className="text-muted mb-0">
                  {businesses.length} {businesses.length === 1 ? "business" : "businesses"} found
                </p>
              )}
            </div>
            <span className="search-results-icon" aria-hidden="true">⌕</span>
          </div>

          <div className="row mt-4">
            {loading ? (
              <div className="col-12 text-center py-4">
                <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading search results" />
                <p className="text-muted mb-0">Searching local businesses...</p>
              </div>
            ) : error ? (
              <div className="col-12 text-center py-4">
                <h3>{error}</h3>
              </div>
            ) : businesses.length === 0 ? (
              <div className="col-12 text-center py-4">
                <h3>No businesses found for &quot;{submittedSearch}&quot;.</h3>
                <p className="text-muted mb-0">Try another search.</p>
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
                    description={business.description}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <section className="container mt-4 mb-5">
        <div className="directory-alpha-wrap">
          <span className="directory-alpha-label">Browse A–Z:</span>
          <div className="directory-alpha-list">
            {alphaLetters.map((letter) => (
              <button
                key={letter}
                type="button"
                className="directory-alpha-item"
                onClick={() => navigate(`/business?search=${encodeURIComponent(letter)}`)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container mt-4 mb-5">
        <div className="directory-section-head">
          <div>
            <span className="ai-kicker">Popular categories</span>
            <h2 className="mt-3 mb-2">Browse All Services in Bareilly</h2>
          </div>
          <Link className="btn btn-outline-primary" to="/categories">
            View all categories
          </Link>
        </div>

        <div className="directory-category-grid">
          {directoryCategories.map(({ emoji, label }) => (
            <button
              key={label}
              type="button"
              className="directory-category-card"
              onClick={() => navigate(`/business?category=${encodeURIComponent(label)}`)}
            >
              <span className="directory-category-icon">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="container mt-5">
        <AIQueryPanel compact />
      </section>

      <section className="container mt-5">
        <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-4 gap-3">
          <div>
            <h2 className="mb-2">Featured local businesses</h2>
            <p className="text-muted mb-0">
              A curated selection of places worth discovering in Bareilly.
            </p>
          </div>
          <Link to="/business" className="btn btn-outline-primary">View all businesses</Link>
        </div>

        <div className="row">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading" />
              <p className="text-muted">Loading businesses...</p>
            </div>
          ) : error ? (
            <div className="col-12 text-center py-5">
              <h3>{error}</h3>
            </div>
          ) : businesses.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h3>{submittedSearch ? "No closely matching businesses found." : "No businesses found."}</h3>
              <p>{submittedSearch ? "Try another category or location." : "Please check back soon for new listings."}</p>
            </div>
          ) : (
            businesses.slice(0, 6).map((business) => (
              <div className="col-md-4 mb-4" key={business._id}>
                <BusinessCard
                  id={business._id}
                  BusinessName={business.name}
                  category={business.category}
                  Address={business.location}
                  Rating={business.ratingAverage}
                  Reviews={business.reviewCount || 0}
                  image={business.image}
                  description={business.description}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="container mt-5 mb-5">
        <div className="directory-surface p-4 p-md-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="ai-kicker">Local discovery</span>
              <h2 className="mt-3 mb-3">Trending categories in Bareilly</h2>
              <p className="text-muted mb-0">
                Explore the most searched local categories with trusted options and community-backed reviews.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/business" className="btn btn-primary btn-lg">Browse all businesses</Link>
            </div>
          </div>

          <div className="row g-3 mt-2">
            {categories.map(({ name, count }) => (
              <div className="col-md-6 col-lg-3" key={name}>
                <div className="mini-stat-box">
                  <strong>{count}</strong>
                  <span>{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mt-5 mb-5">
        <h2 className="text-center mb-4">Why Choose Bareilly Connects?</h2>

        <div className="row gy-4">
          <div className="col-md-4">
            <FeatureCard
              icon="AI"
              title="AI Recommendations"
              description="Get smart business suggestions instantly."
            />
          </div>

          <div className="col-md-4">
            <FeatureCard
              icon="Map"
              title="Nearby Choices"
              description="Find top local businesses close to you."
            />
          </div>

          <div className="col-md-4">
            <FeatureCard
              icon="Top"
              title="Trusted Reviews"
              description="See honest ratings and feedback from visitors, stored securely in the database."
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
