// Classification thresholds — ported from App.jsx
// CLSF[bow][ageCategory][gender][roundName] = [IA3, IA2, IA1, IB3, IB2, IB1, IMB, IGMB]
export const LBL = ["IA3","IA2","IA1","IB3","IB2","IB1","IMB","IGMB"];

const CLSF = {
  recurve: {
    Senior: {
      men: {
        "Portsmouth":[378,437,483,518,546,566,582,593],
        "Bray I":[134,172,205,232,252,268,280,289],
        "Bray II":[156,191,221,243,260,274,284,292],
        "WA 18m":[272,347,413,466,506,537,560,578],
        "WA 25m":[283,357,420,470,508,538,561,578],
        "Stafford":[368,453,523,578,620,653,678,697],
        "Vegas (Triple Face)":[181,263,357,442,501,537,560,578],
        "Vegas 300":[134,172,205,232,252,268,280,289],
        "Worcester":[149,188,221,247,267,282,293,299],
      },
      women: {
        "Portsmouth":[331,399,454,496,528,553,572,586],
        "Bray I":[108,146,183,215,239,258,272,283],
        "Bray II":[131,168,202,229,249,265,278,287],
        "WA 18m":[221,297,371,432,480,517,545,567],
        "WA 25m":[232,308,380,438,484,519,546,567],
        "Stafford":[307,397,478,543,594,632,662,685],
        "Vegas (Triple Face)":[137,206,294,387,465,515,545,567],
        "Vegas 300":[108,146,183,215,239,258,272,283],
        "Worcester":[122,162,200,231,255,273,286,296],
      },
    },
    "50+": {
      men: {
        "Portsmouth":[316,387,444,488,522,549,569,583],
        "Bray I":[101,139,176,209,235,254,270,281],
        "WA 18m":[206,282,357,421,472,511,540,563],
        "Worcester":[114,154,193,225,250,270,284,294],
      },
      women: {
        "Portsmouth":[265,341,407,460,501,532,556,574],
        "Bray I":[79,113,152,188,218,242,260,274],
        "WA 18m":[162,231,308,380,439,486,521,549],
        "Worcester":[90,128,168,205,234,257,275,288],
      },
    },
    "60+": {
      men: {
        "Portsmouth":[316,387,444,488,522,549,569,583],
        "WA 18m":[206,282,357,421,472,511,540,563],
      },
      women: {
        "Portsmouth":[265,341,407,460,501,532,556,574],
        "WA 18m":[162,231,308,380,439,486,521,549],
      },
    },
    U18: {
      men: {
        "Portsmouth":[250,326,395,450,493,526,552,571],
        "Bray I":[73,106,144,181,213,238,257,271],
        "WA 18m":[149,216,292,366,429,477,515,544],
        "Worcester":[84,120,160,198,229,253,272,286],
      },
      women: {
        "Portsmouth":[201,276,350,415,466,505,536,559],
        "Bray I":[55,83,118,157,192,222,244,262],
        "WA 18m":[113,170,241,318,389,446,491,525],
        "Worcester":[64,95,133,173,209,238,260,277],
      },
    },
    U16: {
      men: {
        "Portsmouth":[187,260,336,403,457,498,530,555],
        "WA 18m":[104,157,226,302,375,436,483,519],
      },
      women: {
        "Portsmouth":[145,211,286,360,423,472,510,539],
        "WA 18m":[77,120,179,251,328,397,453,496],
      },
    },
    U15: { men: { "Portsmouth":[134,196,271,346,411,463,503,534] }, women: { "Portsmouth":[134,196,271,346,411,463,503,534] } },
    U14: { men: { "Portsmouth":[92,141,206,281,355,419,469,508] }, women: { "Portsmouth":[92,141,206,281,355,419,469,508] } },
    U12: { men: { "Portsmouth":[62,98,149,215,291,364,426,475] }, women: { "Portsmouth":[62,98,149,215,291,364,426,475] } },
  },
  compound: {
    Senior: {
      men: {
        "Portsmouth":[472,508,532,549,560,571,583,594],
        "Bray I":[200,228,248,263,273,280,286,292],
        "WA 18m":[403,458,498,527,546,560,571,583],
        "Vegas 300":[201,230,252,269,281,290,297,300],
        "Worcester":[217,246,267,283,294,300,null,null],
      },
      women: {
        "Portsmouth":[449,491,521,541,555,566,577,589],
        "Bray I":[182,215,239,256,268,277,283,289],
        "WA 18m":[369,432,480,514,538,553,565,577],
        "Vegas 300":[183,216,242,261,275,286,294,299],
        "Worcester":[200,233,257,276,289,298,null,null],
      },
    },
    "50+": {
      men: {
        "Portsmouth":[437,482,515,537,552,563,574,586],
        "WA 18m":[350,418,469,507,533,550,563,574],
        "Vegas 300":[174,209,236,257,272,284,292,298],
      },
      women: {
        "Portsmouth":[408,461,500,527,545,558,568,580],
        "WA 18m":[311,386,446,490,521,542,557,568],
        "Vegas 300":[154,192,223,247,265,278,288,295],
      },
    },
    U18: {
      men: { "Portsmouth":[400,450,490,518,538,554,567,578] },
      women: { "Portsmouth":[360,415,460,495,520,540,556,568] },
    },
  },
  barebow: {
    Senior: {
      men: {
        "Portsmouth":[331,387,433,472,503,528,549,565],
        "Bray I":[108,139,169,197,220,239,254,267],
        "WA 18m":[221,282,343,397,443,480,511,535],
        "Vegas 300":[108,139,169,197,220,239,254,267],
        "Worcester":[122,154,186,213,236,255,270,281],
      },
      women: {
        "Portsmouth":[276,336,391,437,475,505,530,550],
        "Bray I":[83,111,141,172,199,222,240,256],
        "WA 18m":[170,226,287,347,401,446,483,513],
        "Worcester":[95,125,157,188,215,238,256,271],
      },
    },
    "50+": {
      men: {
        "Portsmouth":[276,336,391,437,475,505,530,550],
        "WA 18m":[170,226,287,347,401,446,483,513],
      },
      women: {
        "Portsmouth":[220,281,341,395,440,477,508,532],
        "WA 18m":[127,174,231,292,352,405,450,486],
      },
    },
    U18: {
      men: { "Portsmouth":[200,270,340,400,450,490,522,548] },
      women: { "Portsmouth":[160,225,295,360,415,460,497,525] },
    },
  },
  longbow: {
    Senior: {
      men: {
        "Portsmouth":[127,178,240,306,369,423,466,501],
        "Bray I":[32,48,69,96,128,162,192,218],
        "WA 18m":[66,98,142,197,261,328,389,439],
        "Worcester":[38,55,79,109,144,178,209,234],
      },
      women: {
        "Portsmouth":[84,123,174,235,301,364,419,463],
        "Bray I":[21,31,47,67,94,126,159,190],
        "WA 18m":[43,64,95,138,192,256,323,384],
        "Worcester":[24,36,54,77,107,141,176,207],
      },
    },
    "50+": {
      men: {
        "Portsmouth":[90,130,183,245,311,373,426,469],
        "WA 18m":[46,68,101,145,202,266,333,393],
      },
      women: {
        "Portsmouth":[58,87,127,178,240,306,369,423],
        "WA 18m":[29,44,66,98,142,197,261,328],
      },
    },
    U18: {
      men: { "Portsmouth":[80,120,170,230,295,358,413,458] },
      women: { "Portsmouth":[55,85,125,175,235,300,360,415] },
    },
  },
};

// Map profile values → CLSF keys
const BOW_KEY = { Recurve: "recurve", Compound: "compound", Barebow: "barebow", Longbow: "longbow" };
const GENDER_KEY = { Male: "men", Female: "women" };

// Normalise age category to a CLSF key
function ageKey(cat) {
  if (!cat) return "Senior";
  if (["U12","U14","U15","U16"].includes(cat)) return cat;
  if (cat === "U18") return "U18";
  if (cat === "50+" || cat === "60+") return "50+";
  return "Senior";
}

/**
 * Returns the classification label for one score, or null.
 */
export function getClassification(bowType, ageCategory, gender, roundName, score) {
  const bk = BOW_KEY[bowType];
  const gk = GENDER_KEY[gender];
  if (!bk || !gk) return null;
  const thresholds = CLSF[bk]?.[ageKey(ageCategory)]?.[gk]?.[roundName];
  if (!thresholds) return null;
  let best = null;
  for (let i = 0; i < thresholds.length; i++) {
    if (thresholds[i] !== null && score >= thresholds[i]) best = LBL[i];
  }
  return best;
}

/**
 * Given all available scores, returns the highest classification label
 * a given archer has achieved with a specific bow type.
 */
export function bestClassForBow(allScores, profileId, bowType, gender, ageCategory) {
  const relevant = allScores.filter(s => s.profile_id === profileId && s.bow_type === bowType);
  let bestIdx = -1;
  for (const s of relevant) {
    const cls = getClassification(bowType, ageCategory, gender, s.round_name, s.score);
    const idx = LBL.indexOf(cls);
    if (idx > bestIdx) bestIdx = idx;
  }
  return bestIdx >= 0 ? LBL[bestIdx] : null;
}
