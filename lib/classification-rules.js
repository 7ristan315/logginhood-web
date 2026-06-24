// AGB Classification rules engine

export const LEVELS = ["A3", "A2", "A1", "B3", "B2", "B1", "MB", "GMB", "EMB"];
export const LEVEL_NAMES = {
  A3: "Archer 3rd", A2: "Archer 2nd", A1: "Archer 1st",
  B3: "Bowman 3rd", B2: "Bowman 2nd", B1: "Bowman 1st",
  MB: "Master Bowman", GMB: "Grand Master Bowman", EMB: "Elite Master Bowman",
};
export const LEVEL_SHORT = {
  A3: "A3", A2: "A2", A1: "A1", B3: "B3", B2: "B2", B1: "B1",
  MB: "MB", GMB: "GMB", EMB: "EMB",
};
export const LEVEL_COLOURS = {
  A3: "#6B7280", A2: "#6B7280", A1: "#6B7280",
  B3: "#2563EB", B2: "#2563EB", B1: "#2563EB",
  MB: "#7C3AED", GMB: "#D97706", EMB: "#DC2626",
};

export const TIERS = {
  archer:  { levels: ["A3", "A2", "A1"], outdoor_arrows: 144, indoor_arrows: 120, event: "any" },
  bowman:  { levels: ["B3", "B2", "B1"], outdoor_arrows: 216, indoor_arrows: 180, event: "competitive" },
  master:  { levels: ["MB", "GMB", "EMB"], outdoor_arrows: 432, indoor_arrows: 180, event: "record_status" },
};

export function tierForLevel(level) {
  if (["A3", "A2", "A1"].includes(level)) return "archer";
  if (["B3", "B2", "B1"].includes(level)) return "bowman";
  return "master";
}

export function arrowsRequired(level, isIndoor) {
  const tier = TIERS[tierForLevel(level)];
  return isIndoor ? tier.indoor_arrows : tier.outdoor_arrows;
}

export function eventRequired(level) {
  return TIERS[tierForLevel(level)].event;
}

export function eventMeetsRequirement(scoreStatus, requiredEvent) {
  if (requiredEvent === "any") return true;
  if (requiredEvent === "competitive") return ["Competition", "UKRS", "WRS"].includes(scoreStatus);
  if (requiredEvent === "record_status") return ["UKRS", "WRS"].includes(scoreStatus);
  return false;
}

// Indoor season: 1 Jul - 30 Jun
// Outdoor season: 1 Jan - 31 Dec
export function getCurrentSeason(isIndoor) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (isIndoor) {
    const startYear = month >= 6 ? year : year - 1;
    return { start: `${startYear}-07-01`, end: `${startYear + 1}-06-30`, label: `${startYear}/${startYear + 1}` };
  }
  return { start: `${year}-01-01`, end: `${year}-12-31`, label: `${year}` };
}

// Indoor classifications don't have EMB
export function availableLevels(isIndoor) {
  return isIndoor ? LEVELS.filter(l => l !== "EMB") : LEVELS;
}

// Calculate classification progress from a set of scores
export function calculateProgress(scores, thresholds, bowType, ageCategory, gender, isIndoor) {
  const season = getCurrentSeason(isIndoor);
  const seasonScores = scores.filter(s => s.shot_at >= season.start && s.shot_at <= season.end);
  const levels = availableLevels(isIndoor);

  const result = {
    season,
    isIndoor,
    bowType,
    levels: [],
    currentLevel: null,
    nextLevel: null,
  };

  for (const level of levels) {
    const required = arrowsRequired(level, isIndoor);
    const requiredEvent = eventRequired(level);

    // Find qualifying scores for this level
    const qualifying = seasonScores.filter(s => {
      if (!eventMeetsRequirement(s.status, requiredEvent)) return false;
      const threshold = getThreshold(thresholds, bowType, ageCategory, gender, s.round_name, level);
      if (threshold === null) return false;
      return s.score >= threshold;
    });

    // Count total arrows from qualifying scores
    const totalArrows = qualifying.reduce((sum, s) => sum + (s.arrows_used || estimateArrows(s.round_name)), 0);
    const arrowsMet = totalArrows >= required;
    const scoresMet = qualifying.length >= 3;
    const achieved = scoresMet && arrowsMet;

    result.levels.push({
      level,
      name: LEVEL_NAMES[level],
      colour: LEVEL_COLOURS[level],
      qualifying: qualifying.length,
      qualifyingScores: qualifying.slice(0, 5),
      totalArrows,
      arrowsRequired: required,
      arrowsMet,
      scoresMet,
      achieved,
      requiredEvent,
    });

    if (achieved) result.currentLevel = level;
  }

  // Next level is the one after current
  const currentIdx = result.currentLevel ? levels.indexOf(result.currentLevel) : -1;
  if (currentIdx < levels.length - 1) {
    result.nextLevel = result.levels[currentIdx + 1];
  }

  return result;
}

function getThreshold(thresholds, bowType, ageCategory, gender, roundName, level) {
  if (!thresholds?.length) return null;
  const levelIdx = LEVELS.indexOf(level);
  const row = thresholds.find(t =>
    t.bow_type === bowType &&
    t.age_category === ageCategory &&
    t.gender === gender &&
    t.round_name === roundName
  );
  if (!row?.thresholds) return null;
  return row.thresholds[levelIdx] ?? null;
}

function estimateArrows(roundName) {
  const ARROW_COUNTS = {
    Portsmouth: 60, Worcester: 60, "WA 18m": 60, "WA 25m": 60,
    "Bray I": 30, "Bray II": 30, "Vegas 300": 60, Stafford: 72, Frostbite: 36,
    York: 144, Hereford: 144, "Bristol I": 144, "Bristol II": 144,
    "Bristol III": 144, "Bristol IV": 144, "Bristol V": 144,
    National: 72, "Short National": 72, Western: 96, American: 90,
    Windsor: 108, Albion: 108, "St George": 108,
    "WA 1440 (Gents)": 144, "WA 1440 (Ladies)": 144,
    "WA 70m": 72, "WA 60m": 72, "WA 50m": 72,
    "Long Metric I": 72, "Long Metric II": 72, "Long Metric III": 72,
    "Long Metric IV": 72, "Long Metric V": 72,
    "Short Metric I": 72, "Short Metric II": 72, "Short Metric III": 72,
  };
  return ARROW_COUNTS[roundName] || 60;
}
