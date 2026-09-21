import AIQueryPanel from "../components/AIQueryPanel";

function AISearch() {
  return (
    <div className="ai-page">
      <section className="container py-5">
        <div className="ai-page-hero mb-4">
          <span className="ai-kicker">Bareilly Connects AI</span>
          <h1 className="display-5 fw-bold mt-2 mb-3">Search with questions, not filters.</h1>
          <p className="lead text-muted mb-0">
            Ask what you want in natural language and get the closest matching local businesses instantly.
          </p>
        </div>

        <AIQueryPanel compact={false} />
      </section>
    </div>
  );
}

export default AISearch;
