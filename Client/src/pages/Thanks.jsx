import { Link, Navigate, useLocation } from "react-router-dom";

function Thanks() {
  const { state } = useLocation();
  const businessId = state?.businessId;

  if (!businessId) {
    return <Navigate to="/business" replace />;
  }

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="directory-surface text-center p-4 p-md-5">
            <span className="ai-kicker">Listing published</span>
            <h1 className="mt-3 mb-3">Thank you for listing your business</h1>
            <p className="text-muted mb-4">
              Your business has been added successfully and is now available publicly on Bareilly Connects.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
              <Link to={`/business/${businessId}`} className="btn btn-outline-primary btn-lg">View your submitted listing</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Thanks;
