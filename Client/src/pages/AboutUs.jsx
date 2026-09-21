function AboutUs() {
  const points = [
    {
      title: "Local-first discovery",
      text: "We help people find trusted businesses in Bareilly without the hassle of searching across multiple websites.",
    },
    {
      title: "Verified listings",
      text: "Every listing is structured to highlight helpful details like category, location, opening hours, and reviews.",
    },
    {
      title: "Easy community access",
      text: "Users can browse, shortlist, save favorites, and compare businesses much faster in one place.",
    },
  ];

  return (
    <section className="container py-5">
      <div className="row align-items-center g-4">
        <div className="col-lg-6">
          <span className="ai-kicker">About us</span>
          <h1 className="mt-3 mb-3">A modern local directory for Bareilly</h1>
          <p className="text-muted mb-4">
            Bareilly Connects was built to make it easier for residents and visitors to discover quality homes,
            services, food spots, wellness centers, and professional businesses in the city.
          </p>
          <p className="text-muted mb-0">
            The platform blends search, categories, AI-powered discovery, and business listing information into one
            clean experience for local browsing.
          </p>
        </div>

        <div className="col-lg-6">
          <div className="directory-surface p-4 p-md-5">
            <div className="row g-3">
              <div className="col-6">
                <div className="mini-stat-box">
                  <strong>5,000+</strong>
                  <span>Businesses</span>
                </div>
              </div>
              <div className="col-6">
                <div className="mini-stat-box">
                  <strong>323</strong>
                  <span>Categories</span>
                </div>
              </div>
              <div className="col-6">
                <div className="mini-stat-box">
                  <strong>500+</strong>
                  <span>Cities</span>
                </div>
              </div>
              <div className="col-6">
                <div className="mini-stat-box">
                  <strong>24/7</strong>
                  <span>Browsing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {points.map((item) => (
          <div className="col-md-4" key={item.title}>
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
              <h3 className="h5 mb-3">{item.title}</h3>
              <p className="text-muted mb-0">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AboutUs;
