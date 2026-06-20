import { randomUUID } from "crypto";
import { writeFileSync } from "fs";

const ROUNDS = {
  "Bray I":           { ends: 5,  apE: 3, sc: "10z" },
  "Bray II":          { ends: 5,  apE: 3, sc: "10z" },
  Portsmouth:         { ends: 10, apE: 6, sc: "10z" },
  Stafford:           { ends: 16, apE: 6, sc: "10z" },
  "WA 18m":           { ends: 10, apE: 6, sc: "10z" },
  "WA 25m":           { ends: 10, apE: 6, sc: "10z" },
  Worcester:          { ends: 12, apE: 5, sc: "5z"  },
  York:               { ends: 24, apE: 6, sc: "10z" },
  Hereford:           { ends: 24, apE: 6, sc: "10z" },
  Windsor:            { ends: 18, apE: 6, sc: "10z" },
  National:           { ends: 12, apE: 6, sc: "10z" },
  "WA 70m":           { ends: 12, apE: 6, sc: "10z" },
  "WA 60m":           { ends: 12, apE: 6, sc: "10z" },
  "WA 1440 (Gents)":  { ends: 24, apE: 6, sc: "10z" },
  "WA 1440 (Ladies)": { ends: 24, apE: 6, sc: "10z" },
};

const ROUND_NAMES = Object.keys(ROUNDS);
const maxScore = (r) => ROUNDS[r].ends * ROUNDS[r].apE * (ROUNDS[r].sc === "5z" ? 5 : 10);

// Bow type skill ranges (% of max, [min, max])
const BOW_SKILL = {
  Compound: [0.72, 0.97],
  Recurve:  [0.55, 0.87],
  Barebow:  [0.38, 0.72],
  Longbow:  [0.18, 0.52],
};

const BOW_TYPES = Object.keys(BOW_SKILL);
const AGE_CATS = ["U18", "U16", "U14", "Senior", "Senior", "Senior", "Senior", "50+", "50+", "60+"]; // weighted
const GENDERS = ["Male", "Female"];
const STATUSES = ["Competition", "Competition", "Competition", "Practice"];
const CLASSIFICATIONS = ["A1","A2","A3","B1","B2","B3","C1","C2","C3","MB","GMB",null,null];

const CLUB_NAMES = [
  "Greenwood Archers","Silverbow Club","Northern Arrows","Lakeside Archery",
  "Midland Bowmen","Coastal Archers","Highland Archers","Valley Archers",
  "Riverside Bowmen","Ironwood Archers","Westfield Archers","Elmwood Archery Club",
  "Meadowlark Bowmen","Stonebridge Archers","Thornfield Archers","Castleton Archers",
  "Moorland Archers","Bridgewater Bowmen","Redwood Archery Club","Ashford Bowmen",
];

const FIRST_NAMES = [
  "Oliver","Emma","James","Sophie","William","Charlotte","George","Amelia",
  "Harry","Isabelle","Jack","Evelyn","Thomas","Grace","Edward","Lucy",
  "Henry","Hannah","Samuel","Chloe","Daniel","Lily","Alexander","Ella",
  "Benjamin","Mia","Jacob","Scarlett","Ethan","Zoe","Noah","Freya",
  "Logan","Poppy","Liam","Daisy","Ryan","Alice","Lucas","Harriet",
  "Max","Rosie","Oscar","Matilda","Charlie","Phoebe","Joshua","Imogen",
];
const LAST_NAMES = [
  "Smith","Jones","Williams","Taylor","Brown","Davies","Evans","Wilson",
  "Thomas","Roberts","Johnson","Walker","Wright","Thompson","Robinson",
  "White","Hughes","Edwards","Green","Hall","Lewis","Harris","Clarke",
  "Patel","Jackson","Turner","Wood","Martin","Cooper","Hill","King",
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return Math.random() * (max - min) + min; }

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function generateScore(roundName, bow) {
  const max = maxScore(roundName);
  const [lo, hi] = BOW_SKILL[bow];
  // Each archer has a base skill level, add per-score variance
  const base = randFloat(lo, hi);
  const variance = (Math.random() - 0.5) * 0.12;
  const pct = Math.max(0.05, Math.min(0.99, base + variance));
  return Math.round(pct * max);
}

function esc(s) { return `'${s.replace(/'/g, "''")}'`; }

// Real admin user to satisfy created_by NOT NULL on clubs trigger
const ADMIN_USER_ID = "afff38e8-198e-4052-a5aa-3f655a4195ce";

// --- Generate data ---
const lines = [];
lines.push("-- Logginhood test data");
lines.push("-- Run in Supabase SQL editor");
lines.push("");

// Generate members first so we can reference their IDs in clubs created_by
const clubs = CLUB_NAMES.map((name) => ({ id: randomUUID(), name }));

// 2. Generate members per club
const allMembers = [];

for (const club of clubs) {
  const count = randInt(10, 15);
  for (let i = 0; i < count; i++) {
    const gender = rand(GENDERS);
    const firstName = rand(FIRST_NAMES);
    const lastName = rand(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const bow = rand(BOW_TYPES);
    const age = rand(AGE_CATS);
    const uid = randomUUID();
    allMembers.push({ uid, fullName, gender, bow, age, clubId: club.id, clubName: club.name });
  }
}

// 3. Auth users FIRST (clubs trigger needs created_by to be a valid user)
lines.push("-- AUTH USERS (test accounts — no real login needed)");
lines.push(`INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)`);
lines.push(`VALUES`);
lines.push(allMembers.map((m, idx) =>
  `  (${esc(m.uid)}, ${esc(`testuser${idx + 1}@logginhood-test.invalid`)}, now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, 'authenticated')`
).join(",\n"));
lines.push(`ON CONFLICT (id) DO NOTHING;`);
lines.push("");

// 4. Clubs (after auth users so created_by FK is satisfied; use admin user as creator)
lines.push("-- CLUBS");
lines.push(`INSERT INTO public.clubs (id, name, created_by) VALUES`);
lines.push(clubs.map(c => `  (${esc(c.id)}, ${esc(c.name)}, ${esc(ADMIN_USER_ID)})`).join(",\n"));
lines.push(`ON CONFLICT (id) DO NOTHING;`);
lines.push("");

// 5. Profiles
lines.push("-- PROFILES");
lines.push(`INSERT INTO public.profiles (id, full_name, gender, bow_type, age_category, club_id) VALUES`);
lines.push(allMembers.map(m =>
  `  (${esc(m.uid)}, ${esc(m.fullName)}, ${esc(m.gender)}, ${esc(m.bow)}, ${esc(m.age)}, ${esc(m.clubId)})`
).join(",\n"));
lines.push(`ON CONFLICT (id) DO UPDATE SET full_name=EXCLUDED.full_name, gender=EXCLUDED.gender, bow_type=EXCLUDED.bow_type, age_category=EXCLUDED.age_category, club_id=EXCLUDED.club_id;`);
lines.push("");

// 6. Club members
lines.push("-- CLUB MEMBERS");
lines.push(`INSERT INTO public.club_members (profile_id, club_id, role, status) VALUES`);
lines.push(allMembers.map(m =>
  `  (${esc(m.uid)}, ${esc(m.clubId)}, 'member', 'approved')`
).join(",\n"));
lines.push(`ON CONFLICT (profile_id, club_id) DO NOTHING;`);
lines.push("");

// 6. Scores — 3 per round per member, spread over past 180 days
lines.push("-- SCORES");
lines.push(`INSERT INTO public.scores (id, profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, classification) VALUES`);

const scoreRows = [];
for (const m of allMembers) {
  // Each member shoots 3 of each round
  for (const round of ROUND_NAMES) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const daysAgo = randInt(attempt * 30, attempt * 30 + 60);
      const sc = generateScore(round, m.bow);
      const max = maxScore(round);
      const golds = Math.round((sc / max) * randInt(0, ROUNDS[round].ends * ROUNDS[round].apE));
      const status = rand(STATUSES);
      const cls = rand(CLASSIFICATIONS);
      scoreRows.push(
        `  (${esc(randomUUID())}, ${esc(m.uid)}, ${esc(round)}, ${sc}, ${golds}, ${esc(randomDate(daysAgo))}, ${esc(status)}, ${esc(m.bow)}, ${esc(m.age)}, ${cls ? esc(cls) : "NULL"})`
      );
    }
  }
}

lines.push(scoreRows.join(",\n"));
lines.push(`ON CONFLICT (id) DO NOTHING;`);
lines.push("");
lines.push("-- Done! Generated " + allMembers.length + " members across " + clubs.length + " clubs.");
lines.push("-- Total scores: " + scoreRows.length);

const sql = lines.join("\n");
writeFileSync("scripts/test-data.sql", sql);
console.log(`Generated ${allMembers.length} members, ${scoreRows.length} scores.`);
console.log("Output: scripts/test-data.sql");
