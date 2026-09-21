import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stateMessage = location.state?.message || "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        login(response.data.user);
        navigate(location.state?.from?.pathname || "/profile", { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">

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
                  Welcome back
                </p>
                <h2 className="mb-0">Login</h2>
                <p className="text-muted mt-2 mb-0">
                  Sign in to access your profile and local business recommendations.
                </p>
              </div>

              {stateMessage && (
                <div className="alert alert-success">{stateMessage}</div>
              )}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleLogin}>

              <div className="mb-3">
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

              <p className="text-center text-muted mt-4 mb-0">
                Don't have an account? <Link to="/register">Register now</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
