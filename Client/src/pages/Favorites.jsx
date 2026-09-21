import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Favorites() {
  const navigate = useNavigate();
  const { user, isAuthenticated, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const favorites = user?.favorites || [];

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-4 gap-3">
        <div>
          <h2 className="mb-2">Your Favorites</h2>
          <p className="text-muted mb-0">Businesses you saved for quick access later.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate("/business")}>
          Browse more
        </button>
      </div>

      <div className="row">
        {favorites.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h3>No favorites yet.</h3>
            <p className="text-muted">Open a business and tap Save to favorites.</p>
          </div>
        ) : (
          favorites.map((business) => {
            const businessId = business._id || business.id;

            return (
              <div className="col-md-4 mb-4" key={businessId}>
                <div className="card business-card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
                  <div className="ratio ratio-4x3 position-relative overflow-hidden">
                    {business.image ? (
                      <img src={business.image} className="card-img-top object-fit-cover" alt={business.name} />
                    ) : (
                      <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">No image available</div>
                    )}
                    <span className="badge bg-primary-soft text-primary position-absolute top-0 start-0 m-3">
                      {business.category}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{business.name}</h5>
                    <p className="text-muted mb-3">{business.location}</p>
                    <div className="mb-4">
                      <span className="badge bg-primary me-2">
                        {Number(business.ratingAverage || business.rating) > 0
                          ? `Rating ${Number(business.ratingAverage || business.rating).toFixed(1)}`
                          : "No ratings yet"}
                      </span>
                      <span className="text-muted">{business.reviewCount || 0} reviews</span>
                    </div>
                    <button className="btn btn-primary mt-auto" onClick={() => navigate(`/business/${businessId}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Favorites;
