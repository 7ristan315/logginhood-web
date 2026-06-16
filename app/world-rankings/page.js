import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RankingsScores from "./RankingsScores";
import WorldRecords from "./WorldRecords";

export const metadata = { title: "World Rankings — Logginhood" };

async function fetchAll(query) {
  const PAGE = 1000;
  let from = 0;
  const rows = [];
  while (true) {
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error || !data?.length) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

export default async function WorldRankingsPage({ searchParams }) {
  const { tab = "scores" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profiles and clubs separately to avoid FK join issues
  const profiles = await fetchAll(
    supabase.from("profiles").select("id, full_name, gender, club_id")
  );

  const { data: clubs } = await supabase.from("clubs").select("id, name");
  const clubMap = Object.fromEntries((clubs || []).map((c) => [c.id, c.name]));

  const profileMap = Object.fromEntries(
    profiles.map((p) => [p.id, {
      full_name: p.full_name,
      gender: p.gender,
      club_name: p.club_id ? (clubMap[p.club_id] ?? "—") : "—",
    }])
  );

  // All scores — paginated to get past the 1000-row default limit
  const rawScores = await fetchAll(
    supabase
      .from("scores")
      .select("id, profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
      .order("shot_at", { ascending: false })
  );

  const scores = (rawScores || []).map((s) => ({
    ...s,
    full_name: profileMap[s.profile_id]?.full_name ?? "Unknown",
    gender: profileMap[s.profile_id]?.gender ?? null,
    club_name: profileMap[s.profile_id]?.club_name ?? "—",
  }));

  const memberCount = (profiles || []).filter((p) => p.club_id).length;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-0 p-4 md:p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">🌍 World Rankings</h1>
        <p className="text-sm opacity-60">{memberCount} archers · {scores.length} scores</p>
      </div>

      {/* Tab nav */}
      <div className="tab-nav">
        <a href="/world-rankings" className={tab === "scores" ? "active" : ""}>Rankings</a>
        <a href="/world-rankings?tab=records" className={tab === "records" ? "active" : ""}>World records</a>
      </div>

      {tab === "records" ? (
        <WorldRecords scores={scores} />
      ) : (
        <RankingsScores scores={scores} />
      )}
    </main>
  );
}
