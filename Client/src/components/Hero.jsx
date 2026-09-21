import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import "./Hero.css";

function Hero({ businesses = [], search, setSearch, onSearch, loading }) {
  const navigate = useNavigate();

  const verifiedListings = businesses.length;
  const ratedBusinesses = businesses.filter((business) => Number(business.ratingAverage) > 0);
  const averageRating = ratedBusinesses.length
    ? (ratedBusinesses.reduce((sum, item) => sum + Number(item.ratingAverage), 0) / ratedBusinesses.length).toFixed(1)
    : "--";
  const totalReviews = businesses.reduce((sum, item) => sum + Number(item.reviewCount || 0), 0);

  return (
    <section className="hero-section">
      <div className="hero-inner container">
        <div className="hero-copy">
          <span className="hero-badge">Local business discovery</span>
          <h1 className="hero-title">Find the best local shops, services, and food near you.</h1>
          <p className="hero-subtitle">
            Bareilly Connects helps you explore trusted businesses with real reviews, fast search, and beautiful local discovery.
          </p>

          <SearchBar search={search} setSearch={setSearch} onSearch={onSearch} loading={loading} />

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/business")}>Browse Businesses</button>
            <button className="btn btn-outline-primary btn-lg" onClick={() => navigate("/ai-search")}>Ask AI</button>
          </div>
        </div>

        <div className="hero-card shadow-lg">
          <div className="hero-card-intro">
            <span className="hero-card-icon">⌕</span>
            <div>
              <p className="text-muted mb-1">Your local guide</p>
              <h3 className="mb-0">Find your next favourite place.</h3>
            </div>
          </div>

          <div className="hero-discovery-note">
            <span className="hero-discovery-check">✓</span>
            <span>Curated local listings with useful details, real reviews, and easy directions.</span>
          </div>

          <div className="hero-stats row g-3 mt-3">
            <div className="col-6">
              <div className="stat-box">
                <strong>{verifiedListings || "--"}</strong>
                <p className="mb-0 text-muted">Local listings</p>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-box">
                <strong>{averageRating}</strong>
                <p className="mb-0 text-muted">Average rating</p>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-box">
                <strong>{totalReviews ? Math.min(totalReviews, 99999).toLocaleString() : "--"}</strong>
                <p className="mb-0 text-muted">Reviews</p>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-box">
                <strong>24/7</strong>
                <p className="mb-0 text-muted">Discovery access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Hero;
