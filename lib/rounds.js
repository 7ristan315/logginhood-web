// Round definitions ported from the logginhood scoring app.
// ends: number of ends, arrowsPerEnd: arrows per end, scoring: "10z" (0-10/X) or "5z" (0-5)

export const ROUNDS = {
  // Indoor
  "Bray I": { ends: 5, arrowsPerEnd: 3, scoring: "10z", distance: "20 yds" },
  "Bray II": { ends: 5, arrowsPerEnd: 3, scoring: "10z", distance: "25 yds" },
  Portsmouth: { ends: 10, arrowsPerEnd: 6, scoring: "10z", distance: "20 yds" },
  Stafford: { ends: 20, arrowsPerEnd: 6, scoring: "10z", distance: "30 m" },
  "WA 18m": { ends: 10, arrowsPerEnd: 6, scoring: "10z", distance: "18 m" },
  "WA 25m": { ends: 10, arrowsPerEnd: 6, scoring: "10z", distance: "25 m" },
  Worcester: { ends: 12, arrowsPerEnd: 5, scoring: "5z", distance: "20 yds" },
  "Vegas 300": { ends: 10, arrowsPerEnd: 3, scoring: "10z", distance: "18 m" },
  Frostbite: { ends: 6, arrowsPerEnd: 6, scoring: "10z", distance: "30 m" },
  // Outdoor — Imperial
  York: { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "100/80/60 yds" },
  Hereford: { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "80/60/50 yds" },
  "Bristol I": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "80/60/50 yds" },
  "Bristol II": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "60/50/40 yds" },
  "Bristol III": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "50/40/30 yds" },
  "Bristol IV": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "40/30/20 yds" },
  "Bristol V": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "30/20/10 yds" },
  "St George": { ends: 18, arrowsPerEnd: 6, scoring: "10z", distance: "100/80/60 yds" },
  Albion: { ends: 18, arrowsPerEnd: 6, scoring: "10z", distance: "80/60/50 yds" },
  Windsor: { ends: 18, arrowsPerEnd: 6, scoring: "10z", distance: "60/50/40 yds" },
  "Windsor 50": { ends: 18, arrowsPerEnd: 6, scoring: "10z", distance: "50/40/30 yds" },
  "Windsor 40": { ends: 18, arrowsPerEnd: 6, scoring: "10z", distance: "40/30/20 yds" },
  "Short Windsor": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50/40/30 yds" },
  National: { ends: 16, arrowsPerEnd: 6, scoring: "10z", distance: "60/50 yds" },
  "National 30": { ends: 8, arrowsPerEnd: 6, scoring: "10z", distance: "30/20 yds" },
  Western: { ends: 16, arrowsPerEnd: 6, scoring: "10z", distance: "60/50 yds" },
  American: { ends: 15, arrowsPerEnd: 6, scoring: "10z", distance: "60/50/40 yds" },
  "Warwick 30": { ends: 4, arrowsPerEnd: 6, scoring: "10z", distance: "30/20 yds" },
  Warwick: { ends: 8, arrowsPerEnd: 6, scoring: "10z", distance: "50/40 yds" },
  // Outdoor — Metric
  "Long Metric I": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "70/60 m" },
  "Long Metric II": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "60/50 m" },
  "Long Metric III": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50/40 m" },
  "Long Metric IV": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "40/30 m" },
  "Long Metric V": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "30/20 m" },
  "Short Metric I": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50/30 m" },
  "Short Metric II": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "40/30 m" },
  "Short Metric III": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "30/20 m" },
  "Short Metric IV": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "20/10 m" },
  "Short Metric V": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "15/10 m" },
  "WA 70m": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "70 m" },
  "WA 60m": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "60 m" },
  "WA 50m": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50 m" },
  "WA 1440 (Gents)": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "90/70/50/30 m" },
  "WA 1440 (Ladies)": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "70/60/50/30 m" },
};

export function maxScore(roundName) {
  const round = ROUNDS[roundName];
  if (!round) return null;
  const perArrow = round.scoring === "5z" ? 5 : 10;
  return round.ends * round.arrowsPerEnd * perArrow;
}

export function roundNames() {
  return Object.keys(ROUNDS);
}

export function normPct(score, roundName) {
  const max = maxScore(roundName);
  if (!max) return null;
  return Math.round((score / max) * 1000) / 10;
}

export function stdDev(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}
