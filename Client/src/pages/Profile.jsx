import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [businessError, setBusinessError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadBusinesses = async () => {
      setLoadingBusinesses(true);
      setBusinessError("");

      try {
        const response = await api.get("/users/me/businesses");
        if (response.data?.success) {
          setBusinesses(response.data.businesses || []);
        }
      } catch (error) {
        setBusinesses([]);
        setBusinessError(error.response?.data?.message || "Could not load your listings.");
      } finally {
        setLoadingBusinesses(false);
      }
    };

    loadBusinesses();
  }, [isAuthenticated]);

  const handleDelete = async (businessId) => {
    try {
      setDeletingId(businessId);
      setConfirmingId(null);
      setMessage("");
      setBusinessError("");
      await api.delete(`/businesses/${businessId}`);
      setBusinesses((current) => current.filter((business) => business._id !== businessId));
      setMessage("Business listing deleted successfully.");
    } catch (error) {
      setBusinessError(error.response?.data?.message || "Could not delete this business listing.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="card profile-card shadow-lg border-0 overflow-hidden">
            <div className="row g-0">
              <div className="col-md-5 profile-sidebar bg-primary text-white p-5 d-flex flex-column justify-content-between">
                <div>
                  <div
                    className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center fw-bold fs-1 mb-4"
                    style={{ width: "96px", height: "96px" }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <h2 className="fw-bold mb-2">{user.name}</h2>
                  <p className="mb-4 opacity-85">
                    Welcome back to Bareilly Connects.
                  </p>
                </div>

                <div className="mt-4">
                  <div className="badge bg-white text-primary py-2 px-3 rounded-pill mb-2">
                    Member since 2024
                  </div>
                  <p className="mb-0 text-white-75">
                    Your registered location is <strong>{user.location || "Not set"}</strong>.
                  </p>
                </div>
              </div>

              <div className="col-md-7">
                <div className="card-body p-4 p-md-5">
                  <p className="text-uppercase text-muted small mb-2">
                    Account overview
                  </p>
                  <h1 className="h3 mb-4">Profile dashboard</h1>

                  <div className="row gy-3">
                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 h-100">
                        <small className="text-uppercase text-muted">Name</small>
                        <p className="mb-0 fw-semibold">{user.name}</p>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 h-100">
                        <small className="text-uppercase text-muted">Email</small>
                        <p className="mb-0 fw-semibold">{user.email}</p>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 h-100">
                        <small className="text-uppercase text-muted">Location</small>
                        <p className="mb-0 fw-semibold">{user.location || "Unknown"}</p>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 h-100">
                        <small className="text-uppercase text-muted">Status</small>
                        <p className="mb-0 fw-semibold">Active member</p>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 h-100">
                        <small className="text-uppercase text-muted">Role</small>
                        <p className="mb-0 fw-semibold">{user.role || "user"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button className="btn btn-outline-danger px-4" onClick={handleLogout}>
                      Logout
                    </button>
                    <button className="btn btn-primary px-4 ms-2" onClick={() => navigate("/favorites")}>
                      Favorites
                    </button>
                    {user.role === "admin" && (
                      <button className="btn btn-dark px-4 ms-2" onClick={() => navigate("/admin")}>
                        Admin dashboard
                      </button>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <p className="text-uppercase text-muted small mb-1">Business owner area</p>
                        <h2 className="h5 mb-0">Your listings</h2>
                      </div>
                      <button className="btn btn-sm btn-primary" onClick={() => navigate("/add-business")}>Add listing</button>
                    </div>
                    {message && <div className="alert alert-success py-2">{message}</div>}
                    {businessError && <div className="alert alert-danger py-2">{businessError}</div>}
                    {loadingBusinesses ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" aria-label="Loading listings" />
                      </div>
                    ) : businesses.length === 0 ? (
                      <p className="text-muted mb-0">You have not submitted a business yet.</p>
                    ) : (
                      <div className="list-group gap-2">
                        {businesses.map((business) => (
                          <div key={business._id} className="list-group-item px-3 py-3 rounded-3">
                            <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                              <button
                                type="button"
                                className="btn btn-link text-start text-decoration-none text-reset p-0 flex-grow-1"
                                onClick={() => navigate(`/business/${business._id}`)}
                              >
                                <div className="d-flex align-items-start gap-3">
                                  {business.image && (
                                    <img src={business.image} alt="" width="64" height="64" className="rounded-2 object-fit-cover" />
                                  )}
                                  <div>
                                    <strong>{business.name}</strong>
                                    <div className="small text-muted">{business.category} - {business.location}{business.city ? `, ${business.city}` : ""}</div>
                                    {business.status === "rejected" && business.rejectionReason && (
                                      <div className="small text-danger mt-1">Reason: {business.rejectionReason}</div>
                                    )}
                                  </div>
                                </div>
                              </button>
                              <div className="d-flex flex-wrap align-items-start gap-2">
                                <span className={`badge align-self-start ${business.status === "approved" ? "text-bg-success" : business.status === "rejected" ? "text-bg-danger" : "text-bg-warning"}`}>
                                  {business.status}
                                </span>
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/business/${business._id}`)}>
                                  View
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/business/${business._id}/edit`)}>
                                  Edit
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setConfirmingId(business._id)} disabled={deletingId === business._id}>
                                  {deletingId === business._id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmingId && (
        <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="delete-business-title" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 id="delete-business-title" className="modal-title h5">Delete business listing</h2>
                <button type="button" className="btn-close" aria-label="Cancel" onClick={() => setConfirmingId(null)} />
              </div>
              <div className="modal-body">Are you sure you want to delete this business listing?</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setConfirmingId(null)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(confirmingId)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
