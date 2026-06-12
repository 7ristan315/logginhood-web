// Shared helpers for the club records / leaderboard pages.

export const GENDERS = ["Male", "Female"];
export const AGE_CATEGORIES = ["U12", "U14", "U15", "U16", "U18", "Senior", "50+", "60+"];
export const BOW_TYPES = ["Recurve", "Compound", "Barebow", "Longbow"];
export const STATUSES = ["Practice", "Competition", "UKRS", "WRS"];

// Filterable fields, in the order they're offered when adding a filter row.
export const FILTER_FIELDS = [
  { key: "gender", label: "Gender", options: GENDERS },
  { key: "age_category", label: "Age category", options: AGE_CATEGORIES },
  { key: "bow_type", label: "Bow type", options: BOW_TYPES },
  { key: "status", label: "Status", options: STATUSES },
];

export function fieldLabel(key) {
  return FILTER_FIELDS.find((f) => f.key === key)?.label ?? key;
}

export function getFieldValue(row, key) {
  if (key === "gender") return row.profiles?.gender ?? null;
  return row[key] ?? null;
}

// Reduce a list of score rows to each archer's single best score.
export function personalBests(rows) {
  const best = new Map();
  for (const r of rows) {
    const cur = best.get(r.profile_id);
    if (!cur || r.score > cur.score) best.set(r.profile_id, r);
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}

export function classificationKey(row) {
  return [row.age_category ?? "—", row.profiles?.gender ?? "—", row.bow_type ?? "—"].join("|");
}

export function classificationLabel(key) {
  const [age, gender, bow] = key.split("|");
  return [age, gender, bow].filter((p) => p !== "—").join(" · ") || "Unclassified";
}

// Sort order for classification cards: age category, then gender, then bow.
export function classificationSortValue(key) {
  const [age, gender, bow] = key.split("|");
  const a = AGE_CATEGORIES.indexOf(age);
  const g = GENDERS.indexOf(gender);
  const b = BOW_TYPES.indexOf(bow);
  return (a < 0 ? 99 : a) * 100 + (g < 0 ? 9 : g) * 10 + (b < 0 ? 9 : b);
}
