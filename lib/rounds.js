// Round definitions ported from the logginhood scoring app.
// ends: number of ends, arrowsPerEnd: arrows per end, scoring: "10z" (0-10/X) or "5z" (0-5)

export const ROUNDS = {
  // ── Indoor ──
  Portsmouth:     { ends: 20, arrowsPerEnd: 3, scoring: "10z", distance: "20 yd" },
  Worcester:      { ends: 12, arrowsPerEnd: 5, scoring: "5z",  distance: "20 yd" },
  "Bray I":       { ends: 10, arrowsPerEnd: 3, scoring: "10z", distance: "20 yd" },
  "Bray II":      { ends: 10, arrowsPerEnd: 3, scoring: "10z", distance: "25 yd" },
  Stafford:       { ends: 24, arrowsPerEnd: 3, scoring: "10z", distance: "30 m" },
  "WA 18m":       { ends: 20, arrowsPerEnd: 3, scoring: "10z", distance: "18 m" },
  "WA 25m":       { ends: 20, arrowsPerEnd: 3, scoring: "10z", distance: "25 m" },
  "WA Combined":  { ends: 40, arrowsPerEnd: 3, scoring: "10z", distance: "25 m / 18 m" },
  "Vegas 300":    { ends: 20, arrowsPerEnd: 3, scoring: "10z", distance: "18 m" },
  Frostbite:      { ends: 6,  arrowsPerEnd: 6, scoring: "10z", distance: "30 m" },

  // ── Outdoor — Imperial (5-zone scoring: 9,7,5,3,1) ──
  // York / Hereford / Bristol series
  York:           { ends: 24, arrowsPerEnd: 6, scoring: "5z", distance: "100/80/60 yd" },
  Hereford:       { ends: 24, arrowsPerEnd: 6, scoring: "5z", distance: "80/60/50 yd" },
  "Bristol I":    { ends: 24, arrowsPerEnd: 6, scoring: "5z", distance: "80/60/50 yd" },
  "Bristol II":   { ends: 24, arrowsPerEnd: 6, scoring: "5z", distance: "60/50/40 yd" },
  "Bristol III":  { ends: 24, arrowsPerEnd: 6, scoring: "5z", distance: "50/40/30 yd" },
  "Bristol IV":   { ends: 24, arrowsPerEnd: 6, scoring: "5z", distance: "40/30/20 yd" },
  "Bristol V":    { ends: 24, arrowsPerEnd: 6, scoring: "5z", distance: "30/20/10 yd" },
  // St George / Albion / Windsor series
  "St George":    { ends: 18, arrowsPerEnd: 6, scoring: "5z", distance: "100/80/60 yd" },
  Albion:         { ends: 18, arrowsPerEnd: 6, scoring: "5z", distance: "80/60/50 yd" },
  Windsor:        { ends: 18, arrowsPerEnd: 6, scoring: "5z", distance: "60/50/40 yd" },
  "Short Windsor":       { ends: 18, arrowsPerEnd: 6, scoring: "5z", distance: "50/40/30 yd" },
  "Junior Windsor":      { ends: 18, arrowsPerEnd: 6, scoring: "5z", distance: "40/30/20 yd" },
  "Short Junior Windsor":{ ends: 18, arrowsPerEnd: 6, scoring: "5z", distance: "30/20/10 yd" },
  // Western series
  "New Western":         { ends: 16, arrowsPerEnd: 6, scoring: "5z", distance: "100/80 yd" },
  "Long Western":        { ends: 16, arrowsPerEnd: 6, scoring: "5z", distance: "80/60 yd" },
  Western:               { ends: 16, arrowsPerEnd: 6, scoring: "5z", distance: "60/50 yd" },
  "Short Western":       { ends: 16, arrowsPerEnd: 6, scoring: "5z", distance: "50/40 yd" },
  "Junior Western":      { ends: 16, arrowsPerEnd: 6, scoring: "5z", distance: "40/30 yd" },
  "Short Junior Western":{ ends: 16, arrowsPerEnd: 6, scoring: "5z", distance: "30/20 yd" },
  // American
  American:       { ends: 15, arrowsPerEnd: 6, scoring: "5z", distance: "60/50/40 yd" },
  // National series
  "New National":          { ends: 12, arrowsPerEnd: 6, scoring: "5z", distance: "100/80 yd" },
  "Long National":         { ends: 12, arrowsPerEnd: 6, scoring: "5z", distance: "80/60 yd" },
  National:                { ends: 12, arrowsPerEnd: 6, scoring: "5z", distance: "60/50 yd" },
  "Short National":        { ends: 12, arrowsPerEnd: 6, scoring: "5z", distance: "50/40 yd" },
  "Junior National":       { ends: 12, arrowsPerEnd: 6, scoring: "5z", distance: "40/30 yd" },
  "Short Junior National": { ends: 12, arrowsPerEnd: 6, scoring: "5z", distance: "30/20 yd" },
  "National 30":           { ends: 8,  arrowsPerEnd: 6, scoring: "5z", distance: "30/20 yd" },
  // Warwick series
  "New Warwick":           { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "100/80 yd" },
  "Long Warwick":          { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "80/60 yd" },
  Warwick:                 { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "60/50 yd" },
  "Short Warwick":         { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "50/40 yd" },
  "Warwick 50":            { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "50/40 yd" },
  "Warwick 30":            { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "30/20 yd" },
  "Junior Warwick":        { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "40/30 yd" },
  "Short Junior Warwick":  { ends: 8, arrowsPerEnd: 6, scoring: "5z", distance: "30/20 yd" },
  // Other imperial
  "St Nicholas":  { ends: 14, arrowsPerEnd: 6, scoring: "5z", distance: "40/30 yd" },

  // ── Outdoor — Metric (10-zone scoring) ──
  // WA 1440 / Metric series
  "WA 1440 (Gents)":  { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "90/70/50/30 m" },
  "WA 1440 (Ladies)": { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "70/60/50/30 m" },
  "Metric I":    { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "70/60/50/30 m" },
  "Metric II":   { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "60/50/40/30 m" },
  "Metric III":  { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "50/40/30/20 m" },
  "Metric IV":   { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "40/30/20/10 m" },
  "Metric V":    { ends: 24, arrowsPerEnd: 6, scoring: "10z", distance: "30/20/15/10 m" },
  // Half Metric series
  "Half Metric I":   { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "70/60/50/30 m" },
  "Half Metric II":  { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "60/50/40/30 m" },
  "Half Metric III": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50/40/30/20 m" },
  "Half Metric IV":  { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "40/30/20/10 m" },
  "Half Metric V":   { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "30/20/15/10 m" },
  // Long Metric series
  "Long Metric (Gents)":  { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "90/70 m" },
  "Long Metric (Ladies)": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "70/60 m" },
  "Long Metric I":   { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "70/60 m" },
  "Long Metric II":  { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "60/50 m" },
  "Long Metric III": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50/40 m" },
  "Long Metric IV":  { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "40/30 m" },
  "Long Metric V":   { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "30/20 m" },
  // Short Metric series
  "Short Metric I":  { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50/30 m" },
  "Short Metric II": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "40/30 m" },
  "Short Metric III":{ ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "30/20 m" },
  "Short Metric IV": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "20/10 m" },
  "Short Metric V":  { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "15/10 m" },
  // WA single-distance
  "WA 70m": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "70 m" },
  "WA 60m": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "60 m" },
  "WA 50m": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50 m" },
  "WA 30m": { ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "30 m" },
  // Other metric
  "WA 900":     { ends: 15, arrowsPerEnd: 6, scoring: "10z", distance: "60/50/40 m" },
  "WA Standard":{ ends: 12, arrowsPerEnd: 6, scoring: "10z", distance: "50/30 m" },
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
