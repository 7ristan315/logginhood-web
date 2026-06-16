import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubScores from "./ClubScores";
import ClubRecords from "./ClubRecords";
import CalendarTab from "./CalendarTab";
import TrophiesTab from "./TrophiesTab";

export default async function MyClubPage({ searchParams }) {
  const { tab = "scores" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find user's club membership
  const { data: membership } = await supabase
    .from("club_members")
    .select("club_id, role, clubs(id, name)")
    .eq("profile_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
        <h1 className="text-2xl font-semibold">My club</h1>
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">🏛️</span>
          <p className="text-lg font-medium">You&apos;re not linked to a club yet.</p>
          <p className="max-w-sm text-sm opacity-60">
            Join a club from your profile to see your club&apos;s scores and records here.
          </p>
          <Link href="/profile" className="btn-primary mt-2">Go to profile</Link>
        </div>
      </main>
    );
  }

  const clubId = membership.club_id;
  const userRole = membership.role;
  const clubName = membership.clubs?.name ?? "My club";

  // Fetch all club members
  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, role, profiles(id, full_name, gender)")
    .eq("club_id", clubId);

  const memberIds = (members || []).map((m) => m.profile_id);
  const profileMap = Object.fromEntries((members || []).map((m) => [m.profile_id, m.profiles]));

  // === Scores & Records ===
  let scores = [];
  if (tab === "scores" || tab === "records") {
    const { data: rawScores } = await supabase
      .from("scores")
      .select("id, profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
      .in("profile_id", memberIds.length ? memberIds : ["__none__"])
      .order("shot_at", { ascending: false });

    scores = (rawScores || []).map((s) => ({
      ...s,
      full_name: profileMap[s.profile_id]?.full_name || "Unknown",
      gender: profileMap[s.profile_id]?.gender || null,
    }));
  }

  // === Calendar ===
  let sessions = [], locations = [], keyholderMap = {};
  if (tab === "calendar") {
    const today = new Date().toISOString().slice(0, 10);
    const sixWeeksAgo = new Date(Date.now() - 42 * 86400000).toISOString().slice(0, 10);

    const { data: rawSessions } = await supabase
      .from("sessions")
      .select(`
        id, name, location, description, session_date, start_time, end_time,
        max_places, is_cancelled, keyholder_alert_sent,
        session_bookings(profile_id, profiles(full_name))
      `)
      .eq("club_id", clubId)
      .gte("session_date", sixWeeksAgo)
      .order("session_date", { ascending: true });

    sessions = rawSessions ?? [];
    locations = [...new Set(sessions.map((s) => s.location))];

    // Fetch keyholders per location
    const { data: kh } = await supabase
      .from("keyholders")
      .select("profile_id, location")
      .eq("club_id", clubId)
      .eq("is_active", true);

    for (const k of kh ?? []) {
      if (!keyholderMap[k.location]) keyholderMap[k.location] = [];
      keyholderMap[k.location].push(k.profile_id);
    }
  }

  // === Trophies ===
  let trophies = [];
  if (tab === "trophies") {
    const { data: t } = await supabase
      .from("trophies")
      .select(`
        id, position, awarded_at, competition_id,
        profiles(full_name),
        competitions(name, round_name)
      `)
      .in("profile_id", memberIds.length ? memberIds : ["__none__"])
      .order("awarded_at", { ascending: false });

    trophies = t ?? [];
  }

  const TABS = [
    { key: "scores",    label: "Scores" },
    { key: "records",   label: "Club records" },
    { key: "calendar",  label: "📅 Calendar" },
    { key: "trophies",  label: "🏆 Trophies" },
  ];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-0 p-4 md:p-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{clubName}</h1>
          <p className="text-sm opacity-60">
            {memberIds.length} member{memberIds.length !== 1 ? "s" : ""}
            {tab === "scores" ? ` · ${scores.length} scores` : ""}
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="tab-nav">
        {TABS.map((t) => (
          <Link key={t.key} href={`/my-club?tab=${t.key}`} className={tab === t.key ? "active" : ""}>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "records" && <ClubRecords scores={scores} clubName={clubName} />}
      {tab === "scores" && <ClubScores scores={scores} clubName={clubName} />}
      {tab === "calendar" && (
        <CalendarTab
          sessions={sessions}
          clubId={clubId}
          userId={user.id}
          userRole={userRole}
          locations={locations}
          keyholderIds={keyholderMap}
        />
      )}
      {tab === "trophies" && <TrophiesTab trophies={trophies} />}
    </main>
  );
}
