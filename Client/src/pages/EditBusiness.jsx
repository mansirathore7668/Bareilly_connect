import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ImageUploader from "../components/ImageUploader";
import BusinessMap from "../components/BusinessMap";

const categoryOptions = [
  "Restaurant",
  "Cafe",
  "Medical",
  "Beauty",
  "Fitness",
  "Automotive",
  "Education",
  "Hospitality",
  "Retail",
  "Technology",
  "Professional Services",
  "Other",
];

function EditBusiness() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, authReady } = useAuth();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/businesses/${id}`);

        if (active && response.data?.success) {
          const business = response.data.business;

          // Check if user is the owner
          if (!isAuthenticated || (business.ownerId && business.ownerId !== user?.id)) {
            setError("You are not authorized to edit this business.");
            setLoading(false);
            return;
          }

          setForm({
            name: business.name || "",
            category: business.category || "Restaurant",
            location: business.location || "",
            city: business.city || "Bareilly",
            address: business.address || "",
            latitude: business.latitude ?? "",
            longitude: business.longitude ?? "",
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
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Could not load business details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (authReady && isAuthenticated) {
      fetchBusiness();
    }
  }, [id, isAuthenticated, user, authReady]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (imageUploading || !form.image) {
      setError(imageUploading ? "Please wait for the image upload to finish." : "Please upload a main image.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
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

      const response = await api.put(`/businesses/${id}`, payload);

      if (response.data?.success) {
        navigate(`/business/${id}`, { replace: true });
        return;
      }

      setError(response.data?.message || "Could not update your business listing.");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Could not update your business listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-5 p-4 p-md-5 text-center">
              <h1 className="mt-3 mb-3">Please sign in to edit your business</h1>
              <p className="text-muted mb-4">You must be logged in to edit your business listing.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading" />
        <p className="text-muted">Loading business details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-5 p-4 p-md-5 text-center">
              <h1 className="mt-3 mb-3">Error</h1>
              <p className="text-muted mb-4">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          <div className="directory-surface p-4 p-md-5">
            <div className="mb-4">
              <span className="ai-kicker">Edit business</span>
              <h1 className="mt-3 mb-2">Update your business details</h1>
              <p className="text-muted mb-0">
                Modify any information about your business. Changes will be saved immediately.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Business Name</label>
                  <input className="form-control" value={form.name} onChange={handleChange("name")} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={handleChange("category")}>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Location / Area</label>
                  <input className="form-control" value={form.location} onChange={handleChange("location")} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.city} onChange={handleChange("city")} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Address</label>
                  <input className="form-control" value={form.address} onChange={handleChange("address")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Latitude <span className="text-muted">(optional)</span></label>
                  <input className="form-control" type="number" step="any" min="-90" max="90" value={form.latitude} onChange={handleChange("latitude")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Longitude <span className="text-muted">(optional)</span></label>
                  <input className="form-control" type="number" step="any" min="-180" max="180" value={form.longitude} onChange={handleChange("longitude")} />
                </div>
                <div className="col-12">
                  <label className="form-label">Choose location on map <span className="text-muted">(optional)</span></label>
                  <BusinessMap
                    latitude={form.latitude}
                    longitude={form.longitude}
                    name={form.name || "Selected business location"}
                    address={form.address || form.location}
                    selectable
                    onLocationSelect={([latitude, longitude]) => setForm((current) => ({
                      ...current,
                      latitude: latitude.toFixed(6),
                      longitude: longitude.toFixed(6),
                    }))}
                  />
                  <small className="form-text text-muted">Click the map to place the business marker.</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Landmark</label>
                  <input className="form-control" value={form.landmark} onChange={handleChange("landmark")} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Pincode</label>
                  <input className="form-control" value={form.pincode} onChange={handleChange("pincode")} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={handleChange("phone")} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">WhatsApp</label>
                  <input className="form-control" value={form.whatsapp} onChange={handleChange("whatsapp")} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={form.email} onChange={handleChange("email")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contact Person</label>
                  <input className="form-control" value={form.contactPerson} onChange={handleChange("contactPerson")} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Opening Hours</label>
                  <input className="form-control" value={form.openingHours} onChange={handleChange("openingHours")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Established Year</label>
                  <input className="form-control" value={form.establishedYear} onChange={handleChange("establishedYear")} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Website</label>
                  <input className="form-control" value={form.website} onChange={handleChange("website")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Google Map URL</label>
                  <input className="form-control" value={form.mapUrl} onChange={handleChange("mapUrl")} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Facebook</label>
                  <input className="form-control" value={form.facebook} onChange={handleChange("facebook")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Instagram</label>
                  <input className="form-control" value={form.instagram} onChange={handleChange("instagram")} />
                </div>

                <div className="col-12">
                  <label className="form-label">Business Description</label>
                  <textarea className="form-control" rows="4" value={form.description} onChange={handleChange("description")} required />
                </div>

                <div className="col-12">
                  <label className="form-label">Services (one per line)</label>
                  <textarea className="form-control" rows="3" value={form.servicesText} onChange={handleChange("servicesText")} placeholder="Hair Cutting\nBridal Makeup\nHome Delivery" />
                </div>

                <div className="col-12">
                  <label className="form-label">Tags (one per line)</label>
                  <textarea className="form-control" rows="3" value={form.tagsText} onChange={handleChange("tagsText")} placeholder="Popular\nAffordable\nFamily Friendly" />
                </div>

                <div className="col-12">
                  <ImageUploader
                    value={form.image}
                    publicId={form.imagePublicId}
                    required
                    onUploading={setImageUploading}
                    onUploaded={({ url, publicId }) => setForm((current) => ({ ...current, image: url, imagePublicId: publicId || "" }))}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Gallery Image URLs (one per line)</label>
                  <textarea className="form-control" rows="4" value={form.imagesText} onChange={handleChange("imagesText")} placeholder="https://img-url-1.jpg\nhttps://img-url-2.jpg" />
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || imageUploading}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => navigate(`/business/${id}`)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditBusiness;
