function Contact() {
  return (
    <section className="container py-5">
      <div className="row g-4">
        <div className="col-lg-6">
          <span className="ai-kicker">Contact</span>
          <h1 className="mt-3 mb-3">Let’s connect with the local community</h1>
          <p className="text-muted mb-4">
            Whether you want to list your business, discuss collaboration, or improve the directory experience,
            we’d love to hear from you.
          </p>

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
            <strong className="d-block mb-2">Email</strong>
            <a className="text-decoration-none text-primary" href="mailto:support@bareillyconnects.in">
              support@bareillyconnects.in
            </a>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
            <strong className="d-block mb-2">Phone</strong>
            <a className="text-decoration-none text-primary" href="tel:+919876543210">
              +91 98765 43210
            </a>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4">
            <strong className="d-block mb-2">Location</strong>
            <span className="text-muted">Bareilly, Uttar Pradesh, India</span>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
            <h3 className="mb-4">Send a message</h3>
            <form>
              <div className="mb-3">
                <label className="form-label">Your name</label>
                <input className="form-control" type="text" placeholder="Enter your name" />
              </div>
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input className="form-control" type="email" placeholder="Enter your email" />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows="5" placeholder="Write your message here" />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
