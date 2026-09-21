import { useNavigate } from "react-router-dom";

function BusinessCard({ id, BusinessName, category, Address, Rating, Reviews, image, description }) {
  const navigate = useNavigate();

  return (
    <div className="card business-card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
      <div className="ratio ratio-4x3 position-relative overflow-hidden">
        {image ? (
          <img src={image} className="card-img-top object-fit-cover" alt={BusinessName} />
        ) : (
          <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">No image available</div>
        )}
        <span className="badge bg-primary-soft text-primary position-absolute top-0 start-0 m-3">
          {category}
        </span>
        <span className="verified-badge position-absolute top-0 end-0 m-3">Verified</span>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{BusinessName}</h5>
        <p className="business-card-location text-muted mb-2">{Address}</p>
        {description && <p className="business-card-description text-muted mb-3">{description}</p>}
        <div className="mb-4">
          <span className="badge bg-primary me-2">⭐ {Number(Rating) > 0 ? Number(Rating).toFixed(1) : "No ratings yet"}</span>
          <span className="text-muted">{Reviews} reviews</span>
        </div>
        <button
          className="btn btn-primary mt-auto"
          onClick={() => navigate(`/business/${id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default BusinessCard;
