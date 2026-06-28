const { createClient } = require("@supabase/supabase-js");
const s = createClient("https://ishutbggflhvsxwhxkvg.supabase.co", process.env.SERVICE_ROLE_KEY);

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function rand(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16); }); }

const RISERS = [
  "Hoyt Formula Xi", "Hoyt Xceed", "Hoyt Arcos", "Win&Win Meta DX", "Win&Win ATF-X",
  "Win&Win Black Elk", "MK Archery MK Alpha", "MK Archery MK Z", "Gillo GQ", "Gillo G1",
  "Fivics Titan EX", "Fivics Vellator", "Mybo Elite", "Mybo Wave", "Spigarelli Revolution",
  "WNS Motive FX", "WNS Delta LX", "Kinetic Sovren", "Core Archery Veratos", "PSE Xpression",
];

const LIMBS = [
  "Win&Win Wiawis NS-G", "Win&Win TFT", "Uukha VX+", "Uukha SX+", "UUKHA Omega",
  "Hoyt Integra", "Hoyt Velos", "MK Archery MK Vera", "MK Archery MK 1440", "Fivics Titan EX",
  "Gillo GS8", "WNS Motive FX", "WNS Alpha", "Kinetic Lux", "Core Archery Pulse",
];

const SIGHTS = [
  "Shibuya Ultima RC II", "Shibuya Dual Click", "Axcel Achieve XP", "Axcel AX3000",
  "WNS SPR-200", "WNS SPC-300", "Fivics Titan", "Sure-Loc Quest X",
  "CBE Vertex", "Spot Hogg Fast Eddie", "Axcel AccuTouch",
];

const BUTTONS = [
  "Shibuya DX", "Beiter Button", "AAE Gold", "Fivics VPlunger", "WNS SPR Plunger",
  "Cartel Button", "Gillo Button", "Spigarelli ZT",
];

const TABS = [
  "AAE Elite", "AAE KSL Gold", "Fivics Saker", "Win&Win Wiawis Tab", "Beiter Tab",
  "Soma Max", "WNS S-FT", "Fairweather Tab", "Bateman Cordovan",
];

const STABILISERS = [
  "Doinker Hero", "Doinker Platinum Hi-Mod", "Win&Win HMC+", "Win&Win Wiawis ACS",
  "Fivics CEX2000", "Bee Stinger Competitor", "Shrewd Atlas", "WNS SPR-200",
  "Mybo Onyx", "CBE Torx", "Avalon Tec X",
];

const RELEASE_AIDS = [
  "TruBall Abyss", "Carter RX1", "Carter Chocolate Addiction", "Stan SX3",
  "Scott Sigma", "Spot Hogg Wise Guy", "B3 Rival",
];

const SCOPES = [
  "Axcel AV-31", "Specialty Archery Pro Series", "CBE Tek Target", "Shrewd Nomad",
  "Ultraview UV3", "Feather Vision Lens",
];

const STRINGS = [
  { material: "BCY 8125", strands: "18" }, { material: "BCY 452X", strands: "20" },
  { material: "Dyneema SK75", strands: "16" }, { material: "BCY X", strands: "18" },
  { material: "Angel Majesty", strands: "20" }, { material: "Beiter String", strands: "18" },
];

const ARROW_RESTS = [
  "Shibuya Ultima", "Hoyt Super Rest", "AAE Freakshow", "Beiter Plunger Rest",
  "Hamskea Epsilon", "QAD UltraRest", "Spot Hogg Edge",
];

const ARROWS = [
  { name: "Easton X10", spine: "600", length: '28"', point_weight: "100gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "Easton X10", spine: "500", length: '29"', point_weight: "110gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "Easton ACE", spine: "620", length: '28.5"', point_weight: "100gr", fletching: "Spin Wings", nock: "G nock" },
  { name: "Easton ACE", spine: "570", length: '29"', point_weight: "110gr", fletching: "Spin Wings", nock: "G nock" },
  { name: "Easton X7", spine: "2114", length: '29"', point_weight: "100gr", fletching: "Feathers", nock: "Super nock" },
  { name: "Carbon Express Nano Pro", spine: "600", length: '28"', point_weight: "100gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "Victory VAP TKO", spine: "600", length: '28"', point_weight: "100gr", fletching: "AAE WAV", nock: "Pin nock" },
  { name: "Victory VAP V1", spine: "500", length: '29"', point_weight: "110gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "Gold Tip Pierce", spine: "600", length: '28"', point_weight: "100gr", fletching: "Blazer", nock: "Pin nock" },
  { name: "Black Eagle Intrepid", spine: "500", length: '29"', point_weight: "110gr", fletching: "Feathers", nock: "Press fit" },
  { name: "Skylon Brixton", spine: "600", length: '28"', point_weight: "100gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "Skylon Radius", spine: "500", length: '28.5"', point_weight: "90gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "WNS Axiom", spine: "700", length: '27"', point_weight: "80gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "Avalon Tec One", spine: "600", length: '28"', point_weight: "100gr", fletching: "Spin Wings", nock: "Pin nock" },
  { name: "Easton Carbon One", spine: "550", length: '28"', point_weight: "100gr", fletching: "Feathers", nock: "G nock" },
];

const ROUNDS_INDOOR = {
  "Portsmouth": { ends: 10, apE: 6, max: 600 },
  "WA 18m": { ends: 10, apE: 6, max: 600 },
  "Bray I": { ends: 5, apE: 3, max: 150 },
  "Bray II": { ends: 5, apE: 3, max: 150 },
  "Stafford": { ends: 16, apE: 6, max: 960 },
  "Worcester": { ends: 12, apE: 5, max: 300 },
};

const ROUNDS_OUTDOOR = {
  "York": { ends: 24, apE: 6, max: 1296 },
  "Hereford": { ends: 24, apE: 6, max: 1296 },
  "WA 70m": { ends: 12, apE: 6, max: 720 },
  "WA 50m": { ends: 12, apE: 6, max: 720 },
  "Frostbite": { ends: 6, apE: 6, max: 360 },
  "National": { ends: 12, apE: 6, max: 720 },
  "Western": { ends: 16, apE: 6, max: 960 },
  "Short National": { ends: 12, apE: 6, max: 720 },
};

const ALL_ROUNDS = { ...ROUNDS_INDOOR, ...ROUNDS_OUTDOOR };
const BOWS = ["Recurve", "Compound", "Barebow", "Longbow"];
const GENDERS = ["Male", "Female"];
const AGES = ["U16", "U18", "Senior", "Senior", "Senior", "Senior", "50+"];
const STATUSES = ["Practice", "Practice", "Practice", "Competition"];

const EQUIP = {
  Recurve:  { sight: true, clicker: true, button: true, tab: true, stabilisers: true, release_aid: false, scope: false },
  Compound: { sight: true, clicker: false, button: true, tab: false, stabilisers: true, release_aid: true, scope: true },
  Barebow:  { sight: false, clicker: false, button: true, tab: true, stabilisers: false, release_aid: false, scope: false },
  Longbow:  { sight: false, clicker: false, button: false, tab: true, stabilisers: false, release_aid: false, scope: false },
};

function genScore(round, bow) {
  const r = ALL_ROUNDS[round];
  if (!r) return null;
  const skillBase = { Compound: 0.82, Recurve: 0.72, Barebow: 0.58, Longbow: 0.42 }[bow] || 0.65;
  const skill = skillBase + (Math.random() * 0.3 - 0.1);
  return Math.min(r.max, Math.max(0, Math.round(skill * r.max + (Math.random() - 0.5) * r.max * 0.15)));
}

function genGolds(score, max) {
  const ratio = score / max;
  const maxGolds = Math.round(max / 10);
  return Math.min(maxGolds, Math.max(0, Math.round(ratio * maxGolds * (0.6 + Math.random() * 0.4))));
}

async function seed() {
  // Get existing profiles
  const { data: profiles } = await s.from("profiles").select("id, bow_type, age_category, gender");
  const validProfiles = profiles.filter(p => p.bow_type && p.gender);
  console.log("Profiles available:", validProfiles.length);

  // Get existing clubs
  const { data: members } = await s.from("club_members").select("profile_id, club_id").eq("status", "approved");
  const memberClub = {};
  for (const m of members) memberClub[m.profile_id] = m.club_id;

  // ── 1. Update existing setups with rich JSONB fields ──
  console.log("Enriching existing setups with equipment details...");
  const { data: existingSetups } = await s.from("bow_setups").select("id, bow_type");
  let enriched = 0;
  for (let i = 0; i < existingSetups.length; i += 50) {
    const batch = existingSetups.slice(i, i + 50);
    await Promise.all(batch.map(setup => {
      const eq = EQUIP[setup.bow_type] || EQUIP.Recurve;
      const update = {};
      if (eq.sight) update.sight = { name: pick(SIGHTS), pin: pick(["Fibre .019", "Fibre .029", "Ring .019", ""]) };
      if (eq.button) update.button = { name: pick(BUTTONS), spring: pick(["Light", "Medium", "Heavy"]), position: rand(2, 6) + " turns" };
      if (eq.tab) update.tab = { name: pick(TABS), size: pick(["S", "M", "L", "XL"]) };
      if (eq.stabilisers) update.stabilisers = { long_rod: pick(STABILISERS) + " " + pick(["28\"", "30\"", "32\""]) };
      if (eq.release_aid) update.release_aid = { name: pick(RELEASE_AIDS), type: pick(["Thumb", "Hinge", "Tension"]) };
      if (eq.scope) update.scope = { magnification: pick(["2x", "4x", "6x", "8x"]), housing_size: pick(["29mm", "35mm", "41mm"]) };
      update.string = pick(STRINGS);
      update.arrow_rest = { name: pick(ARROW_RESTS) };
      return s.from("bow_setups").update(update).eq("id", setup.id);
    }));
    enriched += batch.length;
  }
  console.log(`Enriched ${enriched} existing setups`);

  // ── 2. Create new setups + profiles for more variety ──
  console.log("Creating new setups...");
  const newSetups = [];
  const setupProfiles = validProfiles.slice(0, 200);

  for (const prof of setupProfiles) {
    if (Math.random() < 0.4) {
      const altBow = pick(BOWS.filter(b => b !== prof.bow_type));
      const eq = EQUIP[altBow] || EQUIP.Recurve;
      newSetups.push({
        profile_id: prof.id,
        bow_type: altBow,
        name: `My ${altBow}`,
        is_active: false,
        colour: pick(["#1a6bbf", "#2e7d32", "#c62828", "#6a1b9a", "#e65100", "#00695c"]),
        riser: pick(RISERS),
        limbs: pick(LIMBS),
        draw_weight: randInt(24, 46) + " lbs",
        draw_length: randInt(26, 31) + '"',
        sight: eq.sight ? { name: pick(SIGHTS) } : null,
        button: eq.button ? { name: pick(BUTTONS) } : null,
        clicker: eq.clicker ? { type: pick(["Blade", "Magnetic"]) } : null,
        tab: eq.tab ? { name: pick(TABS) } : null,
        release_aid: eq.release_aid ? { name: pick(RELEASE_AIDS), type: pick(["Thumb", "Hinge"]) } : null,
        scope: eq.scope ? { magnification: pick(["4x", "6x"]) } : null,
        stabilisers: eq.stabilisers ? { long_rod: pick(STABILISERS) + " 30\"" } : null,
        string: pick(STRINGS),
        arrow_rest: { name: pick(ARROW_RESTS) },
        version: 1,
      });
    }
  }

  let insertedSetups = [];
  for (let i = 0; i < newSetups.length; i += 50) {
    const batch = newSetups.slice(i, i + 50);
    const { data, error } = await s.from("bow_setups").insert(batch).select("id, profile_id, bow_type");
    if (error) console.error("Setup insert error:", error.message);
    else insertedSetups.push(...data);
  }
  console.log(`Created ${insertedSetups.length} new setups`);

  // ── 3. Arrows for new setups ──
  console.log("Adding arrows to new setups...");
  const arrowRows = [];
  for (const setup of insertedSetups) {
    const arrow = pick(ARROWS);
    arrowRows.push({ setup_id: setup.id, name: arrow.name, spine: arrow.spine, length: arrow.length, point_weight: arrow.point_weight, fletching: arrow.fletching, nock: arrow.nock, is_active: true });
  }
  for (let i = 0; i < arrowRows.length; i += 100) {
    await s.from("setup_arrows").insert(arrowRows.slice(i, i + 100));
  }
  console.log(`Added ${arrowRows.length} arrow sets`);

  // ── 4. Sight/crawl marks for new setups ──
  const sightRows = [], crawlRows = [];
  for (const setup of insertedSetups) {
    if (setup.bow_type === "Recurve" || setup.bow_type === "Compound") {
      for (const d of ["70 m", "60 m", "50 m", "30 m", "20 yds", "18 m"]) {
        if (Math.random() < 0.7) sightRows.push({ setup_id: setup.id, distance: d, sight_number: rand(1, 8), extension_bar: Math.random() < 0.3 ? randInt(0, 4) : null });
      }
    } else {
      for (const d of ["20 yds", "30 yds", "40 yds", "50 yds"]) {
        if (Math.random() < 0.7) crawlRows.push({ setup_id: setup.id, distance: d, finger_position: pick(["3 under", "split"]), anchor: pick(["chin", "lip"]), tab_count: rand(0, 5) });
      }
    }
  }
  for (let i = 0; i < sightRows.length; i += 100) await s.from("sight_marks").insert(sightRows.slice(i, i + 100));
  for (let i = 0; i < crawlRows.length; i += 100) await s.from("crawl_marks").insert(crawlRows.slice(i, i + 100));
  console.log(`Added ${sightRows.length} sight marks, ${crawlRows.length} crawl marks`);

  // ── 5. Generate scores for new setups ──
  console.log("Generating scores for new setups...");
  const allSetups = [...insertedSetups];
  // Also get some existing setups to add more scores
  const { data: moreSetups } = await s.from("bow_setups").select("id, profile_id, bow_type").limit(300);
  allSetups.push(...moreSetups);

  const scoreRows = [];
  const today = new Date();

  for (const setup of allSetups) {
    const numScores = randInt(5, 30);
    const rounds = Object.keys(ALL_ROUNDS);
    for (let j = 0; j < numScores; j++) {
      const round = pick(rounds);
      const r = ALL_ROUNDS[round];
      const score = genScore(round, setup.bow_type);
      if (score === null) continue;
      const daysAgo = randInt(0, 365);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const prof = validProfiles.find(p => p.id === setup.profile_id);

      scoreRows.push({
        profile_id: setup.profile_id,
        club_id: memberClub[setup.profile_id] || null,
        round_name: round,
        score,
        golds: genGolds(score, r.max),
        shot_at: date.toISOString().slice(0, 10),
        status: pick(STATUSES),
        bow_type: setup.bow_type,
        age_category: prof?.age_category || "Senior",
        setup_id: setup.id,
      });
    }
  }

  console.log(`Inserting ${scoreRows.length} scores...`);
  let scoreOk = 0;
  for (let i = 0; i < scoreRows.length; i += 200) {
    const batch = scoreRows.slice(i, i + 200);
    const { error } = await s.from("scores").insert(batch);
    if (error) console.error("Score batch error:", error.message);
    else scoreOk += batch.length;
    if (i % 2000 === 0) process.stdout.write(`  ${i}/${scoreRows.length}\r`);
  }
  console.log(`Inserted ${scoreOk} scores`);

  // ── 6. More competition entries ──
  console.log("Adding competition entries...");
  const { data: comps } = await s.from("competitions").select("id, round_name, status");
  for (const comp of comps) {
    const { data: compScores } = await s.from("scores")
      .select("profile_id, score, bow_type")
      .eq("round_name", comp.round_name)
      .order("score", { ascending: false })
      .limit(60);

    const { data: existing } = await s.from("competition_entries").select("profile_id").eq("competition_id", comp.id);
    const existingSet = new Set(existing.map(e => e.profile_id));

    const entries = [];
    for (const sc of compScores) {
      if (existingSet.has(sc.profile_id)) continue;
      existingSet.add(sc.profile_id);
      entries.push({ competition_id: comp.id, profile_id: sc.profile_id, score: sc.score, bow_type: sc.bow_type });
    }
    if (entries.length) {
      const { error } = await s.from("competition_entries").insert(entries);
      if (error) console.error(`Entry error (${comp.round_name}):`, error.message);
      else console.log(`  ${comp.round_name}: +${entries.length} entries`);
    }
  }

  // ── 7. Trophies for competitions with enough entries ──
  console.log("Adding trophies...");
  for (const comp of comps.filter(c => c.status === "completed" || c.status === "active")) {
    const { data: topEntries } = await s.from("competition_entries")
      .select("profile_id, score")
      .eq("competition_id", comp.id)
      .order("score", { ascending: false })
      .limit(3);

    for (let i = 0; i < topEntries.length; i++) {
      await s.from("trophies").upsert(
        { profile_id: topEntries[i].profile_id, competition_id: comp.id, position: i + 1 },
        { onConflict: "competition_id,position" }
      );
    }
    console.log(`  ${comp.round_name}: trophies set`);
  }

  // ── Final counts ──
  console.log("\n=== FINAL COUNTS ===");
  const tables = ["profiles", "scores", "bow_setups", "setup_arrows", "sight_marks", "crawl_marks", "competitions", "competition_entries", "trophies", "sessions", "session_bookings"];
  for (const t of tables) {
    const { count } = await s.from(t).select("*", { count: "exact", head: true });
    console.log(`${t}: ${count}`);
  }
}

seed().catch(console.error);
