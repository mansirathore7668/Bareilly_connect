const express = require("express");
const Business = require("../models/Business");
const { scoreBusiness } = require("../utils/businessSearch");
const { attachCalculatedRatings } = require("../utils/businessRatings");

const router = express.Router();

function buildFallbackAnswer(question, matches) {
  if (!matches.length) {
    return "No closely matching businesses found. Try another category or location.";
  }

  return `I found ${matches.length} relevant ${matches.length === 1 ? "business" : "businesses"} for "${question}" in Bareilly.`;
}

function buildBusinessContext(matches) {
  return matches
    .map((business, index) => {
      const reasons = business.matchReasons?.length ? `Reasons: ${business.matchReasons.join(", ")}.` : "";
      return [
        `${index + 1}. ${business.name}`,
        `Category: ${business.category}`,
        `Location: ${business.location}`,
        `Rating: ${Number(business.ratingAverage) > 0 ? `${business.ratingAverage} out of 5` : "No ratings yet"} from ${business.reviewCount || 0} reviews`,
        business.description ? `Description: ${business.description}` : "",
        business.services?.length ? `Services: ${business.services.join(", ")}` : "",
        reasons,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

async function askOpenAI(question, matches) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);
  const model = process.env.OPENAI_MODEL || "gpt-5.6-terra";

  try {
    const prompt = [
      "You are Bareilly Connects AI, a helpful local business search assistant.",
      "Answer in simple Hinglish.",
      "Use only the listings provided below.",
      "Never invent businesses, ratings, or facts. Mention only the provided listings.",
      "If no listings are provided, reply exactly: No closely matching businesses found. Try another category or location.",
      "State the number of relevant businesses found when listings are provided.",
      "Keep the response concise, practical, and friendly.",
      "",
      `User question: ${question}`,
      "",
      "Relevant listings:",
      buildBusinessContext(matches),
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`OpenAI request failed with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = extractResponseText(data);

    return text || null;
  } finally {
    clearTimeout(timeoutId);
  }
}

router.post("/search", async (req, res) => {
  try {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Please type a question or search query.",
      });
    }

    const businesses = await attachCalculatedRatings(
      await Business.find({ status: "approved", isActive: true }).lean()
    );
    const rankedBusinesses = businesses
      .map((business) => {
        const { score, reasons, hasRelevantTerm } = scoreBusiness(business, question);

        return {
          ...business,
          matchScore: score,
          matchReasons: reasons,
          hasRelevantTerm,
        };
      })
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }

        const ratingA = Number(a.ratingAverage || 0);
        const ratingB = Number(b.ratingAverage || 0);

        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }

        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });

    const matches = rankedBusinesses
      .filter((business) => business.hasRelevantTerm)
      .slice(0, 5)
      .map((business) => ({
        ...business,
        matchReasons: business.matchReasons || [],
      }));

    const fallbackAnswer = buildFallbackAnswer(question, matches);
    let answer = fallbackAnswer;
    let mode = "fast-search";

    if (matches.length) {
      try {
        const aiAnswer = await askOpenAI(question, matches);
        if (aiAnswer) {
          answer = aiAnswer;
          mode = "ai";
        }
      } catch (error) {
        console.log("AI search error:", error.message);
      }
    }

    return res.json({
      success: true,
      question,
      answer,
      mode,
      matches: matches.map(({ matchScore, matchReasons, hasRelevantTerm, ...business }) => business),
    });
  } catch (error) {
    console.log("AI search route error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not run AI search right now.",
    });
  }
});

module.exports = router;
