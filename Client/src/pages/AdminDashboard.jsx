import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ImageUploader from "../components/ImageUploader";

const emptyForm = {
  name: "",
  category: "",
  location: "",
  city: "",
  address: "",
  landmark: "",
  pincode: "",
  description: "",
  phone: "",
  whatsapp: "",
  email: "",
  contactPerson: "",
  openingHours: "",
  website: "",
  facebook: "",
  instagram: "",
  mapUrl: "",
  establishedYear: "",
  image: "",
  imagePublicId: "",
  imagesText: "",
  servicesText: "",
  tagsText: "",
};

function AdminDashboard() {
  const { user, isAuthenticated, authReady } = useAuth();
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAdminData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsResponse, businessesResponse, pendingResponse, reviewsResponse] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/businesses", { params: { sort: "newest" } }),
          api.get("/admin/businesses/pending"),
          api.get("/admin/reviews"),
        ]);

        if (!active) {
          return;
        }

        if (statsResponse.data?.success) {
          setStats(statsResponse.data.stats);
        }

        if (businessesResponse.data?.success) {
          setBusinesses(businessesResponse.data.businesses || []);
        }

        if (pendingResponse.data?.success) {
          setPendingBusinesses(pendingResponse.data.businesses || []);
        }

        if (reviewsResponse.data?.success) {
          setReviews(reviewsResponse.data.reviews || []);
        }
      } catch {
        if (active) {
          setError("Could not load admin data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAdminData();

    return () => {
      active = false;
    };
  }, []);

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

  if (user?.role !== "admin") {
    return (
      <div className="container py-5 text-center">
        <h2>Admin access required</h2>
        <p className="text-muted">Your account does not have permission to open this page.</p>
      </div>
    );
  }

  const refreshData = async () => {
    const [statsResponse, businessesResponse, pendingResponse, reviewsResponse] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/businesses", { params: { sort: "newest" } }),
      api.get("/admin/businesses/pending"),
      api.get("/admin/reviews"),
    ]);

    if (statsResponse.data?.success) {
      setStats(statsResponse.data.stats);
    }

    if (businessesResponse.data?.success) {
      setBusinesses(businessesResponse.data.businesses || []);
    }

    if (pendingResponse.data?.success) {
      setPendingBusinesses(pendingResponse.data.businesses || []);
    }

    if (reviewsResponse.data?.success) {
      setReviews(reviewsResponse.data.reviews || []);
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (business) => {
    setEditingId(business._id);
    setForm({
      name: business.name || "",
      category: business.category || "",
      location: business.location || "",
      city: business.city || "",
      address: business.address || "",
      landmark: business.landmark || "",
      pincode: business.pincode || "",
      description: business.description || "",
      phone: business.phone || "",
      whatsapp: business.whatsapp || "",
      email: business.email || "",
      contactPerson: business.contactPerson || "",
      openingHours: business.openingHours || "",
      website: business.website || "",
      facebook: business.facebook || "",
      instagram: business.instagram || "",
      mapUrl: business.mapUrl || "",
      establishedYear: business.establishedYear || "",
      image: business.image || "",
      imagePublicId: business.imagePublicId || "",
      imagesText: (business.images || []).join("\n"),
      servicesText: (business.services || []).join("\n"),
      tagsText: (business.tags || []).join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (imageUploading || !form.image) {
      setError(imageUploading ? "Please wait for the image upload to finish." : "Please upload a main image.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      images: form.imagesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      services: form.servicesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      tags: form.tagsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    delete payload.imagesText;
    delete payload.servicesText;
    delete payload.tagsText;

    try {
      const response = editingId
        ? await api.put(`/businesses/${editingId}`, payload)
        : await api.post("/businesses", payload);

      if (response.data?.success) {
        setMessage(editingId ? "Business updated successfully." : "Business created successfully.");
        clearForm();
        await refreshData();
      } else {
        setError(response.data?.message || "Could not save business.");
      }
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not save business.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm("Delete this business?")) {
      return;
    }

    try {
      await api.delete(`/businesses/${businessId}`);
      setMessage("Business deleted.");
      await refreshData();
    } catch {
      setError("Could not delete business.");
    }
  };

  const handleBusinessStatus = async (businessId, status) => {
    try {
      await api.patch(`/admin/businesses/${businessId}/status`, { status });
      setMessage(`Business ${status}.`);
      await refreshData();
    } catch {
      setError(`Could not ${status} business.`);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    const businessId = review.businessId?._id || review.businessId;
    const reviewId = review._id;

    try {
      await api.delete(`/businesses/${businessId}/reviews/${reviewId}`);
      setMessage("Review deleted.");
      await refreshData();
    } catch {
      setError("Could not delete review.");
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="text-muted mb-0">Manage businesses and moderate reviews from one place.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Businesses</p>
              <h3 className="mb-0">{stats?.businesses ?? businesses.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Reviews</p>
              <h3 className="mb-0">{stats?.reviews ?? reviews.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Users</p>
              <h3 className="mb-0">{stats?.users ?? 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Admins</p>
              <h3 className="mb-0">{stats?.admins ?? 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="mb-0">{editingId ? "Edit Business" : "Add Business"}</h4>
                {editingId && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={clearForm}>
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={form.name} onChange={handleChange("name")} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <input className="form-control" value={form.category} onChange={handleChange("category")} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location / Area</label>
                  <input className="form-control" value={form.location} onChange={handleChange("location")} required />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input className="form-control" value={form.city} onChange={handleChange("city")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Pincode</label>
                    <input className="form-control" value={form.pincode} onChange={handleChange("pincode")} />
                  </div>
                </div>
                <div className="row g-3 mt-0">
                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input className="form-control" value={form.address} onChange={handleChange("address")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Landmark</label>
                    <input className="form-control" value={form.landmark} onChange={handleChange("landmark")} />
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={form.description} onChange={handleChange("description")} required />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={handleChange("phone")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">WhatsApp</label>
                    <input className="form-control" value={form.whatsapp} onChange={handleChange("whatsapp")} />
                  </div>
                </div>
                <div className="row g-3 mt-0">
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={form.email} onChange={handleChange("email")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contact Person</label>
                    <input className="form-control" value={form.contactPerson} onChange={handleChange("contactPerson")} />
                  </div>
                </div>
                <div className="row g-3 mt-0">
                  <div className="col-md-6">
                    <label className="form-label">Opening Hours</label>
                    <input className="form-control" value={form.openingHours} onChange={handleChange("openingHours")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Established Year</label>
                    <input className="form-control" value={form.establishedYear} onChange={handleChange("establishedYear")} />
                  </div>
                </div>
                <div className="row g-3 mt-0">
                  <div className="col-md-6">
                    <label className="form-label">Website</label>
                    <input className="form-control" value={form.website} onChange={handleChange("website")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Map URL</label>
                    <input className="form-control" value={form.mapUrl} onChange={handleChange("mapUrl")} />
                  </div>
                </div>
                <div className="row g-3 mt-0">
                  <div className="col-md-6">
                    <label className="form-label">Facebook</label>
                    <input className="form-control" value={form.facebook} onChange={handleChange("facebook")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Instagram</label>
                    <input className="form-control" value={form.instagram} onChange={handleChange("instagram")} />
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <label className="form-label">Services (one per line)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.servicesText}
                    onChange={handleChange("servicesText")}
                    placeholder="For example: Haircut, Bridal Makeup, Home Delivery"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tags (one per line)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.tagsText}
                    onChange={handleChange("tagsText")}
                    placeholder="For example: Popular, Affordable, Family Friendly"
                  />
                </div>
                <div className="mb-3">
                  <ImageUploader
                    key={editingId || "new-business"}
                    value={form.image}
                    publicId={form.imagePublicId}
                    required
                    onUploading={setImageUploading}
                    onUploaded={({ url, publicId }) => setForm((current) => ({ ...current, image: url, imagePublicId: publicId || "" }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Gallery Image URLs</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.imagesText}
                    onChange={handleChange("imagesText")}
                    placeholder="One image URL per line"
                  />
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={saving || imageUploading}>
                  {saving ? "Saving..." : editingId ? "Update Business" : "Create Business"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 mb-5">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h4 className="mb-1">Pending verification</h4>
                  <p className="text-muted mb-0">Review new business submissions before they appear publicly.</p>
                </div>
                <span className="badge text-bg-warning">{pendingBusinesses.length} waiting</span>
              </div>
              {pendingBusinesses.length === 0 ? (
                <p className="text-muted mb-0">No pending submissions.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {pendingBusinesses.map((business) => (
                    <div key={business._id} className="list-group-item px-0 py-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                          <h5 className="mb-1">{business.name}</h5>
                          <p className="text-muted mb-1">{business.category} - {business.location}</p>
                          <small className="text-muted">
                            Submitted by {business.ownerId?.name || "User"} ({business.ownerId?.email || "no email"})
                          </small>
                        </div>
                        <div className="d-flex gap-2 align-items-start">
                          <button className="btn btn-sm btn-success" onClick={() => handleBusinessStatus(business._id, "approved")}>Approve</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleBusinessStatus(business._id, "rejected")}>Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="mb-0">Businesses</h4>
                <span className="text-muted">{businesses.length} total</span>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" aria-label="Loading" />
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {businesses.map((business) => (
                    <div key={business._id} className="list-group-item px-0 py-3">
                      <div className="d-flex justify-content-between gap-3">
                        <div>
                          <h5 className="mb-1">{business.name}</h5>
                          <p className="text-muted mb-1">
                            {business.category} - {business.location}
                          </p>
                          <small className="text-muted">
                            Rating {Number(business.ratingAverage) > 0 ? Number(business.ratingAverage).toFixed(1) : "No ratings yet"} | Reviews {business.reviewCount || 0}
                          </small>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(business)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteBusiness(business._id)}>
                            Delete
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

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Review Moderation</h4>
            <span className="text-muted">{reviews.length} reviews</span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-muted mb-0">No reviews yet.</p>
          ) : (
            <div className="list-group list-group-flush">
              {reviews.map((review) => (
                <div key={review._id} className="list-group-item px-0 py-3">
                  <div className="d-flex justify-content-between gap-3">
                    <div>
                      <h6 className="mb-1">
                        {review.userId?.name || review.userName} on {review.businessId?.name || "Unknown business"}
                      </h6>
                      <p className="text-muted mb-1">{review.comment}</p>
                      <small className="text-muted">
                        Rating {review.rating} | {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteReview(review)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
