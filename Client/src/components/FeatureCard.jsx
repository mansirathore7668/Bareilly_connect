function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card shadow-sm rounded-4 p-4 h-100">
      <div className="feature-icon rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-4">
        <span className="fs-3">{icon}</span>
      </div>
      <h5 className="mb-3">{title}</h5>
      <p className="text-muted mb-0">{description}</p>
    </div>
  );
}
export default FeatureCard;
