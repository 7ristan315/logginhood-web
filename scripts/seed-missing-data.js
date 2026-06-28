const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ishutbggflhvsxwhxkvg.supabase.co",
  process.env.SERVICE_ROLE_KEY
);

const ARROW_BRANDS = [
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

const SIGHT_DISTANCES = [
  { outdoor: ["70 m", "60 m", "50 m", "40 m", "30 m", "20 m"], indoor: ["20 yds", "18 m", "25 m"] },
];

const CRAWL_CONFIGS = [
  { finger_position: "3 under", anchor: "chin" },
  { finger_position: "3 under", anchor: "lip" },
  { finger_position: "split", anchor: "chin" },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }

async function seed() {
  console.log("Fetching setups...");
  const { data: setups } = await supabase.from("bow_setups").select("id, bow_type, profile_id");
  console.log(`Found ${setups.length} setups`);

  // ── Setup Arrows ──
  console.log("Seeding setup_arrows...");
  const arrowRows = [];
  for (const setup of setups) {
    const arrow = pick(ARROW_BRANDS);
    arrowRows.push({
      setup_id: setup.id,
      name: arrow.name,
      spine: arrow.spine,
      length: arrow.length,
      point_weight: arrow.point_weight,
      fletching: arrow.fletching,
      nock: arrow.nock,
      is_active: true,
    });
    if (Math.random() < 0.3) {
      const arrow2 = pick(ARROW_BRANDS);
      arrowRows.push({
        setup_id: setup.id,
        name: arrow2.name,
        spine: arrow2.spine,
        length: arrow2.length,
        point_weight: arrow2.point_weight,
        fletching: arrow2.fletching,
        nock: arrow2.nock,
        is_active: false,
      });
    }
  }
  for (let i = 0; i < arrowRows.length; i += 100) {
    const batch = arrowRows.slice(i, i + 100);
    const { error } = await supabase.from("setup_arrows").insert(batch);
    if (error) console.error("Arrow insert error:", error.message);
  }
  console.log(`Inserted ${arrowRows.length} arrow sets`);

  // ── Sight Marks (for Recurve/Compound) ──
  console.log("Seeding sight_marks...");
  const sightRows = [];
  const sightSetups = setups.filter(s => s.bow_type === "Recurve" || s.bow_type === "Compound");
  for (const setup of sightSetups) {
    const distances = Math.random() < 0.6
      ? ["70 m", "60 m", "50 m", "40 m", "30 m", "20 m"]
      : ["20 yds", "18 m", "25 m"];
    for (const dist of distances) {
      if (Math.random() < 0.85) {
        sightRows.push({
          setup_id: setup.id,
          distance: dist,
          sight_number: rand(1, 8),
          extension_bar: Math.random() < 0.3 ? Math.floor(Math.random() * 5) : null,
        });
      }
    }
  }
  for (let i = 0; i < sightRows.length; i += 100) {
    const batch = sightRows.slice(i, i + 100);
    const { error } = await supabase.from("sight_marks").insert(batch);
    if (error) console.error("Sight insert error:", error.message);
  }
  console.log(`Inserted ${sightRows.length} sight marks`);

  // ── Crawl Marks (for Barebow/Longbow) ──
  console.log("Seeding crawl_marks...");
  const crawlRows = [];
  const crawlSetups = setups.filter(s => s.bow_type === "Barebow" || s.bow_type === "Longbow");
  for (const setup of crawlSetups) {
    const config = pick(CRAWL_CONFIGS);
    const distances = ["20 yds", "30 yds", "40 yds", "50 yds", "60 yds"];
    for (const dist of distances) {
      if (Math.random() < 0.8) {
        crawlRows.push({
          setup_id: setup.id,
          distance: dist,
          finger_position: config.finger_position,
          anchor: config.anchor,
          tab_count: rand(0, 6),
        });
      }
    }
  }
  for (let i = 0; i < crawlRows.length; i += 100) {
    const batch = crawlRows.slice(i, i + 100);
    const { error } = await supabase.from("crawl_marks").insert(batch);
    if (error) console.error("Crawl insert error:", error.message);
  }
  console.log(`Inserted ${crawlRows.length} crawl marks`);

  // ── Sessions (for clubs with members) ──
  console.log("Seeding sessions...");
  const { data: clubs } = await supabase.from("clubs").select("id, name");
  const sessionRows = [];
  const bookingRows = [];
  const today = new Date();

  for (const club of clubs) {
    const { data: members } = await supabase.from("club_members").select("profile_id").eq("club_id", club.id).eq("status", "approved").limit(20);
    if (!members?.length) continue;

    for (let w = -4; w <= 6; w++) {
      const types = ["practice", "practice", "practice", "competition", "course"];
      const type = pick(types);
      const date = new Date(today);
      date.setDate(date.getDate() + w * 7 + Math.floor(Math.random() * 3));
      const dateStr = date.toISOString().slice(0, 10);
      const isPast = date < today;

      const session = {
        club_id: club.id,
        name: type === "practice" ? `${["Tuesday", "Wednesday", "Thursday", "Saturday"][Math.floor(Math.random() * 4)]} ${type}` : `${club.name} ${type}`,
        location: club.name + " range",
        event_type: type,
        session_date: dateStr,
        start_time: pick(["18:00", "19:00", "10:00", "14:00"]),
        end_time: pick(["20:00", "21:00", "12:00", "16:00"]),
        max_places: pick([12, 16, 20, 24]),
        is_cancelled: Math.random() < 0.05,
      };
      sessionRows.push(session);
    }
  }

  for (let i = 0; i < sessionRows.length; i += 50) {
    const batch = sessionRows.slice(i, i + 50);
    const { data: inserted, error } = await supabase.from("sessions").insert(batch).select("id, club_id");
    if (error) { console.error("Session insert error:", error.message); continue; }

    for (const sess of inserted) {
      const { data: members } = await supabase.from("club_members").select("profile_id").eq("club_id", sess.club_id).eq("status", "approved").limit(10);
      if (!members?.length) continue;
      const numBookings = Math.floor(Math.random() * Math.min(8, members.length));
      const shuffled = members.sort(() => Math.random() - 0.5).slice(0, numBookings);
      for (const m of shuffled) {
        bookingRows.push({ session_id: sess.id, profile_id: m.profile_id });
      }
    }
  }

  for (let i = 0; i < bookingRows.length; i += 100) {
    const batch = bookingRows.slice(i, i + 100);
    const { error } = await supabase.from("session_bookings").insert(batch);
    if (error) console.error("Booking insert error:", error.message);
  }
  console.log(`Inserted ${sessionRows.length} sessions, ${bookingRows.length} bookings`);

  // ── Competition entries ──
  console.log("Seeding competition_entries...");
  const { data: comp } = await supabase.from("competitions").select("id, round_name").limit(1).single();
  if (comp) {
    const { data: scores } = await supabase.from("scores").select("id, profile_id").eq("round_name", comp.round_name).limit(50);
    if (scores?.length) {
      const entryRows = [];
      const seen = new Set();
      for (const s of scores) {
        if (seen.has(s.profile_id)) continue;
        seen.add(s.profile_id);
        entryRows.push({ competition_id: comp.id, profile_id: s.profile_id, score_id: s.id });
      }
      const { error } = await supabase.from("competition_entries").upsert(entryRows, { onConflict: "competition_id,profile_id", ignoreDuplicates: true });
      if (error) console.error("Entry error:", error.message);
      else console.log(`Inserted ${entryRows.length} competition entries`);
    }
  }

  console.log("Done!");
}

seed().catch(console.error);
