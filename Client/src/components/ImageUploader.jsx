import { useState } from "react";
import api from "../api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function ImageUploader({ value, publicId, onUploaded, onUploading, required = false }) {
  const [preview, setPreview] = useState(value || "");
  const [selectedName, setSelectedName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setSelectedName(file.name);
    setUploading(true);
    onUploading?.(true);

    try {
      const data = new FormData();
      data.append("image", file);
      const response = await api.post("/upload/image", data);

      if (!response.data?.success || !response.data.secure_url) {
        throw new Error(response.data?.message || "Could not upload image.");
      }

      setPreview(response.data.secure_url);
      onUploaded({ url: response.data.secure_url, publicId: response.data.public_id });
    } catch (uploadError) {
      setPreview(value || "");
      setSelectedName("");
      setError(uploadError.response?.data?.message || uploadError.message || "Could not upload image.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      onUploading?.(false);
    }
  };

  return (
    <div>
      <label className="form-label">Main Image</label>
      <div className="border rounded-3 p-3 bg-light">
        {(value || preview) && (
          <img
            src={value || preview}
            alt="Business preview"
            className="w-100 rounded-3 mb-3"
            style={{ maxHeight: "240px", objectFit: "cover" }}
          />
        )}
        <input
          className="form-control"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSelect}
          required={required && !value}
          disabled={uploading}
        />
        <div className="form-text">JPG, PNG, or WEBP up to 5 MB.</div>
        {selectedName && <div className="small mt-2">Selected: {selectedName}</div>}
        {uploading && <div className="small text-primary mt-2">Uploading...</div>}
        {!uploading && value && <div className="small text-success mt-2">Uploaded successfully</div>}
        {publicId && <span className="visually-hidden">{publicId}</span>}
        {error && <div className="small text-danger mt-2">{error}</div>}
      </div>
    </div>
  );
}

export default ImageUploader;
