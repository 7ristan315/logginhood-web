import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import RankingsScores from "./RankingsScores";
import WorldRecords from "./WorldRecords";

export const metadata = { title: "World Rankings — Logginhood" };

export default async function WorldRankingsPage({ searchParams }) {
  const { tab = "scores" } = await searchParams;

  // Auth check with user client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use admin client to bypass RLS for public leaderboard data
  const admin = createAdminClient();

  // All profiles with club info
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, gender, club_id, clubs(name)");

  const profileMap = Object.fromEntries(
    (profiles || []).map((p) => [p.id, { full_name: p.full_name, gender: p.gender, club_name: p.clubs?.name ?? "—" }])
  );

  // All scores
  const { data: rawScores } = await admin
    .from("scores")
    .select("id, profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
    .order("shot_at", { ascending: false });

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
