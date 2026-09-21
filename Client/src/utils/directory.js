export function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleize(value = "") {
  return String(value)
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function mapSearchUrl(query) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}
