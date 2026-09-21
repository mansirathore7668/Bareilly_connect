import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import BusinessCard from "./BusinessCard";

const quickPrompts = [
  "best cafe in Civil Lines",
  "top medical shop near me",
  "good salon with high rating",
  "restaurant open late in Bareilly",
];

function AIQueryPanel({ compact = false }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [matches, setMatches] = useState([]);
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async (nextQuestion) => {
    const finalQuestion = typeof nextQuestion === "string" ? nextQuestion.trim() : question.trim();

    if (!finalQuestion) {
      setError("Please type a question first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/ai/search", {
        question: finalQuestion,
      });

      if (response.data?.success) {
        setQuestion(finalQuestion);
        setAnswer(response.data.answer || "");
        setMatches(response.data.matches || []);
        setMode(response.data.mode || "");
      } else {
        setError(response.data?.message || "Could not get AI response.");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not get AI response.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await askQuestion();
  };

  return (
    <section className={compact ? "ai-panel ai-panel-compact" : "ai-panel"}>
      <div className="ai-panel-shell">
        <div className="ai-panel-copy">
          <span className="ai-kicker">AI Search</span>
          <h2 className="ai-title">Ask in natural language and find the right business faster.</h2>
          <p className="ai-description">
            Tell LocalConnect what you need in plain English or Hinglish. The AI will return the closest
            matches and explain why they fit.
          </p>

          <form className="ai-form" onSubmit={handleSubmit}>
            <textarea
              className="form-control ai-textarea"
              rows={compact ? 3 : 4}
              placeholder="Example: best cafe in Civil Lines with good rating"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Searching..." : "Ask AI"}
              </button>
              <Link className="btn btn-outline-primary" to="/business">
                Browse all businesses
              </Link>
            </div>
          </form>

          <div className="ai-suggestions">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="ai-chip"
                onClick={() => askQuestion(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="ai-panel-result">
          {error ? (
            <div className="alert alert-danger mb-0">{error}</div>
          ) : loading ? (
            <div className="ai-result-card text-center">
              <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading" />
              <p className="text-muted mb-0">Finding the best matches...</p>
            </div>
          ) : answer ? (
            <div className="ai-result-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">AI Answer</h5>
                <span className="badge bg-primary-soft text-primary text-uppercase">{mode || "ai"}</span>
              </div>
              <p className="mb-4 ai-answer">{answer}</p>

              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="mb-0">Top matches</h6>
                <span className="text-muted small">{matches.length} relevant</span>
              </div>

              {matches.length === 0 ? (
                <p className="text-muted mb-0">No closely matching businesses found. Try another category or location.</p>
              ) : (
                <div className="row g-3">
                  {matches.slice(0, compact ? 2 : 3).map((business) => (
                    <div className="col-12" key={business._id}>
                      <BusinessCard
                        id={business._id}
                        BusinessName={business.name}
                        category={business.category}
                        Address={business.location}
                        Rating={business.ratingAverage}
                        Reviews={business.reviewCount || 0}
                        image={business.image}
                        description={business.description}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="ai-result-card ai-empty-state">
              <span className="ai-empty-badge">Fast search</span>
              <h5>Ask a question to see smart matches.</h5>
              <p className="text-muted mb-0">
                Example: "Find a good restaurant near Civil Lines" or "Show me a top rated salon".
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AIQueryPanel;
