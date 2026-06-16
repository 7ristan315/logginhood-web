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

  // Single query against the pre-joined materialized view
  const scores = await fetchAll(
    supabase
      .from("score_rankings")
      .select("id, profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, classification, full_name, gender, club_name")
      .order("shot_at", { ascending: false })
  );

  const archerCount = new Set(scores.map((s) => s.profile_id)).size;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-0 p-4 md:p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">🌍 World Rankings</h1>
        <p className="text-sm opacity-60">{archerCount} archers · {scores.length} scores</p>
      </div>

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
