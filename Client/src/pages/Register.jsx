import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !location.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill all the fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        location: location.trim(),
        password,
      });

      if (response.data?.success) {
        if (response.data.user) {
          login(response.data.user);
        }
        navigate("/profile", {
          replace: true,
          state: { message: "Registration successful. Welcome aboard." },
        });
      } else {
        setError(response.data?.message || "Registration failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
                <span className="brand-mark">BC</span>
                <div>
                  <div className="fw-bold text-primary">Bareilly Connects</div>
                  <small className="text-muted">Discover Local. Support Local.</small>
                </div>
              </div>
              <div className="text-center mb-4">
                <p className="text-uppercase text-muted small mb-2">
                  Create your account
                </p>
                <h2 className="mb-0">Register</h2>
                <p className="text-muted mt-2 mb-0">
                  Join Bareilly Connects with your location and start discovering.
                </p>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleRegister}>
                <div className="mb-3 text-start">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="City or neighbourhood"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4 text-start">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>

              <p className="text-center text-muted mt-4 mb-0">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
