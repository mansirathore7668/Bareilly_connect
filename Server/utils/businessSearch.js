const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "for", "near", "me", "my", "to", "of",
  "mujhe", "mujhko", "mujh", "hai", "hain", "mein", "me", "ka", "ki", "ke", "ko",
  "please", "find", "show", "looking", "want", "need", "good", "best", "top", "nearby",
  "chahiye", "chahta", "chahti", "peeni", "peena", "wala", "wali", "with", "and",
]);

const TERM_ALIASES = {
  coffee: ["coffee", "cafe", "cafes", "café"],
  cafe: ["coffee", "cafe", "cafes", "café"],
  cafes: ["coffee", "cafe", "cafes", "café"],
  café: ["coffee", "cafe", "cafes", "café"],
  mehendi: ["mehendi", "mahendi", "mehandi", "mehndi", "henna"],
  mahendi: ["mehendi", "mahendi", "mehandi", "mehndi", "henna"],
  mehandi: ["mehendi", "mahendi", "mehandi", "mehndi", "henna"],
  mehndi: ["mehendi", "mahendi", "mehandi", "mehndi", "henna"],
  salon: ["salon", "beauty", "spa"],
  beauty: ["salon", "beauty", "spa"],
  restaurant: ["restaurant", "restaurants", "food", "dining"],
  restaurants: ["restaurant", "restaurants", "food", "dining"],
  food: ["restaurant", "restaurants", "food", "dining"],
  medical: ["medical", "doctor", "clinic", "hospital", "pharmacy"],
  doctor: ["medical", "doctor", "clinic", "hospital", "pharmacy"],
  pharmacy: ["medical", "doctor", "clinic", "hospital", "pharmacy"],
};

function normalizeText(value) {
  return typeof value === "string"
    ? value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim()
    : "";
}

function tokenizeQuery(query) {
  return normalizeText(query)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function expandTerms(query) {
  return Array.from(new Set(tokenizeQuery(query).flatMap((token) => TERM_ALIASES[token] || [token])));
}

function scoreBusiness(business, query) {
  const normalizedQuery = normalizeText(query);
  const terms = expandTerms(query);
  const name = normalizeText(business.name);
  const category = normalizeText(business.category);
  const location = normalizeText(`${business.location || ""} ${business.city || ""} ${business.address || ""}`);
  const description = normalizeText(business.description);
  const services = normalizeText(`${(business.services || []).join(" ")} ${(business.tags || []).join(" ")}`);
  let score = 0;
  const reasons = [];

  if (normalizedQuery && name === normalizedQuery) {
    score += 100;
    reasons.push("exact name match");
  }

  terms.forEach((term) => {
    if (name.includes(term)) {
      score += 35;
      reasons.push("name match");
    }
    if (category.includes(term)) {
      score += 25;
      reasons.push("category match");
    }
    if (description.includes(term) || services.includes(term)) {
      score += 12;
      reasons.push("description or service match");
    }
    if (location.includes(term)) {
      score += 8;
      reasons.push("location match");
    }
  });

  return {
    score,
    terms,
    reasons: Array.from(new Set(reasons)).slice(0, 4),
    hasRelevantTerm: terms.length > 0 && score > 0,
  };
}

module.exports = {
  normalizeText,
  scoreBusiness,
};