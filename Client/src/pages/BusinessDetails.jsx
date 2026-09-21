import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import BusinessMap from "../components/BusinessMap";
import { getCoordinates } from "../utils/map";

function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError("");

        const [businessResponse, reviewsResponse] = await Promise.all([
          api.get(`/businesses/${id}`),
          api.get(`/businesses/${id}/reviews`),
        ]);

        if (!active) {
          return;
        }

        if (businessResponse.data?.success) {
          setBusiness(businessResponse.data.business);
        }

        if (reviewsResponse.data?.success) {
          setReviews(reviewsResponse.data.reviews || []);
        }
      } catch {
        if (active) {
          setError("Business not found or could not be loaded.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBusiness();

    return () => {
      active = false;
    };
  }, [id]);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
    : Number(business?.ratingAverage) > 0 ? Number(business.ratingAverage).toFixed(1) : null;

  const isFavorite = Boolean(
    user?.favorites?.some((favorite) => {
      const favoriteId = favorite?._id || favorite?.id || favorite;
      return favoriteId?.toString() === id;
    })
  );

  const canModerateReview = (review) => {
    const reviewUserId = review.userId?._id || review.userId?.id || review.userId;
    return user?.role === "admin" || reviewUserId?.toString() === user?.id;
  };

  const handleAddReview = async (event) => {
    event.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/businesses/${id}/reviews`, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      if (response.data?.success) {
        setReviews(response.data.reviews || []);
        setBusiness(response.data.business || business);
        setComment("");
        setRating(5);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = isFavorite
        ? await api.delete(`/users/favorites/${id}`)
        : await api.post(`/users/favorites/${id}`);

      if (response.data?.success && response.data.user) {
        login(response.data.user);
      }
    } catch {
      setError("Could not update favorites right now.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/businesses/${id}/reviews/${reviewId}`);
      const response = await api.get(`/businesses/${id}/reviews`);
      if (response.data?.success) {
        setReviews(response.data.reviews || []);
      }
    } catch {
      setError("Could not delete review.");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading" />
        <p className="text-muted">Loading business details...</p>
      </div>
    );
  }

  if (!business || error) {
    return (
      <div className="container mt-5 text-center">
        <h2>{error || "Business Not Found"}</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>
    );
  }

  const businessCoordinates = getCoordinates(business.latitude, business.longitude);
  const directionsUrl = businessCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${businessCoordinates[0]},${businessCoordinates[1]}`
    : business.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.address || business.location}, ${business.city || "Bareilly"}`)}`;

  return (
    <div className="container mt-5 mb-5">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow border-0 overflow-hidden h-100">
            {business.image ? (
              <img
                src={business.image}
                alt={business.name}
                className="img-fluid w-100"
                style={{ objectFit: "cover", minHeight: "420px" }}
              />
            ) : (
              <div className="w-100 bg-light d-flex align-items-center justify-content-center text-muted" style={{ minHeight: "420px" }}>
                No image available
              </div>
            )}

            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h1 className="h3 fw-bold mb-1">{business.name}</h1>
                  <p className="text-muted mb-0">{business.category} <span className="badge text-bg-success ms-2">Verified</span></p>
                </div>
                <div className="text-end d-flex flex-column gap-2 align-items-end">
                  <div>
                    <span className="badge bg-primary">{averageRating ? `Rating ${averageRating}` : "No ratings yet"}</span>
                    <p className="text-muted small mb-0">{reviews.length} reviews</p>
                  </div>
                  {isAuthenticated && user?.id === business.ownerId && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/business/${id}/edit`)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <div className="p-3 rounded-4 bg-light">
                    <strong>Location</strong>
                    <p className="mb-0">{business.location}</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 rounded-4 bg-light">
                    <strong>Hours</strong>
                    <p className="mb-0">{business.openingHours || "Not specified"}</p>
                  </div>
                </div>
                {business.city && (
                  <div className="col-sm-6">
                    <div className="p-3 rounded-4 bg-light">
                      <strong>City</strong>
                      <p className="mb-0">{business.city}</p>
                    </div>
                  </div>
                )}
                {business.address && (
                  <div className="col-sm-6">
                    <div className="p-3 rounded-4 bg-light">
                      <strong>Address</strong>
                      <p className="mb-0">{business.address}</p>
                    </div>
                  </div>
                )}
                {business.landmark && (
                  <div className="col-sm-6">
                    <div className="p-3 rounded-4 bg-light">
                      <strong>Landmark</strong>
                      <p className="mb-0">{business.landmark}</p>
                    </div>
                  </div>
                )}
                {business.pincode && (
                  <div className="col-sm-6">
                    <div className="p-3 rounded-4 bg-light">
                      <strong>Pincode</strong>
                      <p className="mb-0">{business.pincode}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                {businessCoordinates ? (
                  <BusinessMap
                    latitude={business.latitude}
                    longitude={business.longitude}
                    name={business.name}
                    address={business.address || business.location}
                  />
                ) : (
                  <div className="rounded-4 bg-light p-4 text-muted">
                    Location map is not available for this business yet.
                  </div>
                )}
              </div>

              <p className="mb-3">{business.description}</p>

              <div className="row g-3 mb-3">
                {business.phone && (
                  <div className="col-md-6">
                    <p className="mb-1 text-muted">Phone</p>
                    <a href={`tel:${business.phone}`} className="fw-semibold text-decoration-none">{business.phone}</a>
                  </div>
                )}
                {business.whatsapp && (
                  <div className="col-md-6">
                    <p className="mb-1 text-muted">WhatsApp</p>
                    <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="fw-semibold text-decoration-none">Chat on WhatsApp</a>
                  </div>
                )}
                {business.email && (
                  <div className="col-md-6">
                    <p className="mb-1 text-muted">Email</p>
                    <strong>{business.email}</strong>
                  </div>
                )}
                {business.contactPerson && (
                  <div className="col-md-6">
                    <p className="mb-1 text-muted">Contact Person</p>
                    <strong>{business.contactPerson}</strong>
                  </div>
                )}
                {business.establishedYear && (
                  <div className="col-md-6">
                    <p className="mb-1 text-muted">Established</p>
                    <strong>{business.establishedYear}</strong>
                  </div>
                )}
              </div>

              {business.services?.length > 0 && (
                <div className="mb-3">
                  <p className="text-muted mb-2">Services</p>
                  <div className="d-flex flex-wrap gap-2">
                    {business.services.map((service) => (
                      <span key={service} className="badge bg-primary-soft text-primary px-3 py-2">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {business.tags?.length > 0 && (
                <div className="mb-4">
                  <p className="text-muted mb-2">Tags</p>
                  <div className="d-flex flex-wrap gap-2">
                    {business.tags.map((tag) => (
                      <span key={tag} className="badge bg-secondary-subtle text-dark px-3 py-2">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex flex-wrap gap-2 mt-4">
                {business.website && (
                  <a
                    className="btn btn-outline-secondary"
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit website
                  </a>
                )}
                {business.mapUrl && (
                  <a
                    className="btn btn-outline-primary"
                    href={business.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on Map
                  </a>
                )}
                {(businessCoordinates || business.mapUrl || business.address || business.location) && (
                  <a
                    className="btn btn-outline-primary"
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get Directions
                  </a>
                )}
                {business.facebook && (
                  <a
                    className="btn btn-outline-secondary"
                    href={business.facebook}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Facebook
                  </a>
                )}
                {business.instagram && (
                  <a
                    className="btn btn-outline-secondary"
                    href={business.instagram}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                )}
                {isAuthenticated && (
                  <button className="btn btn-outline-primary" onClick={handleToggleFavorite}>
                    {isFavorite ? "Remove from favorites" : "Save to favorites"}
                  </button>
                )}
              </div>

              <button className="btn btn-outline-secondary mt-4" onClick={() => navigate("/")}>
                Back to Businesses
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 h-100 p-4">
            <h4 className="mb-3">Customer reviews</h4>
            {reviews.length === 0 ? (
              <p className="text-muted">No reviews yet - be the first to add one.</p>
            ) : (
              <div className="mb-4">
                {reviews.map((review) => (
                  <div key={review._id} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
                      <div>
                        <strong>{review.userName}</strong>
                        <p className="mb-0 text-muted small">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-primary mb-2">Rating {review.rating}</span>
                        {isAuthenticated && canModerateReview(review) && (
                          <button
                            className="btn btn-sm btn-outline-danger d-block ms-auto"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mb-0">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-top">
              <h5 className="mb-3">Add your review</h5>
              {isAuthenticated ? (
                <form onSubmit={handleAddReview}>
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <select className="form-select" value={rating} onChange={(event) => setRating(event.target.value)}>
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comment</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Share your experience"
                    />
                  </div>
                  <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit review"}
                  </button>
                </form>
              ) : (
                <p className="text-muted">Please log in to add a review.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetails;
