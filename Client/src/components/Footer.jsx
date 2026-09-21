import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="container footer-shell">
        <div className="footer-cta">
          <div>
            <span className="footer-kicker">Discover Local. Support Local.</span>
            <h4>Find trusted places in your city faster.</h4>
          </div>
          <Link to="/add-business" className="btn btn-light btn-lg">+ Add Your Business</Link>
        </div>

        <div className="row gy-5 footer-grid">
          <div className="col-md-4">
            <div className="footer-brand-block">
              <div className="footer-logo">BC</div>
              <div>
                <h5>Bareilly Connects</h5>
                <small>Discover Local. Support Local.</small>
              </div>
            </div>
            <p className="footer-text">
              Discover verified local businesses, shops, services, and professionals across Bareilly with trusted listings and quick access to real local information.
            </p>
          </div>

          <div className="col-md-2">
            <h5 className="footer-title">Explore</h5>
            <ul className="footer-list list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/business" className="footer-link">A-Z List</Link></li>
              <li><Link to="/categories" className="footer-link">Categories</Link></li>
              <li><Link to="/about-us" className="footer-link">About Us</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h5 className="footer-title">Services</h5>
            <ul className="footer-list list-unstyled">
              <li><Link to="/business?category=Restaurants" className="footer-link">Restaurants</Link></li>
              <li><Link to="/business?category=Medical" className="footer-link">Medical</Link></li>
              <li><Link to="/business?category=Beauty" className="footer-link">Beauty & Wellness</Link></li>
              <li><Link to="/business?category=Cafe" className="footer-link">Cafe</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h5 className="footer-title">Contact</h5>
            <ul className="footer-list list-unstyled">
              <li><a href="mailto:support@bareillyconnects.in" className="footer-link">support@bareillyconnects.in</a></li>
              <li><a href="tel:+919876543210" className="footer-link">+91 98765 43210</a></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Bareilly Connects. All rights reserved.</p>
          <small>Designed for local discovery and business visibility.</small>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
