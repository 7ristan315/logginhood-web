import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RankingsScores from "./RankingsScores";
import WorldRecords from "./WorldRecords";

export const metadata = { title: "World Rankings — Logginhood" };

const ALL_ROUNDS = [
  "Bray I","Bray II","Portsmouth","Stafford","WA 18m","WA 25m","Worcester",
  "York","Hereford","Windsor","National","WA 70m","WA 60m","WA 1440 (Gents)","WA 1440 (Ladies)",
];

const JUNIOR_AGES = ["U12","U14","U15","U16","U18"];
const VALID_SIZES = [25, 50, 100];

export default async function WorldRankingsPage({ searchParams }) {
  const params = await searchParams;
  const tab = params.tab ?? "scores";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Records tab: fetch all scores for known rounds only, filter client-side
  if (tab === "records") {
    const { data: scores } = await supabase
      .from("score_rankings")
      .select("id, profile_id, round_name, score, full_name, club_name, shot_at, gender, age_category, bow_type, gov_body")
      .in("round_name", ALL_ROUNDS)
      .order("score", { ascending: false });

    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-0 p-4 md:p-8">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">🌍 World Rankings</h1>
        </div>
        <div className="tab-nav">
          <a href="/world-rankings">Rankings</a>
          <a href="/world-rankings?tab=records" className="active">World records</a>
        </div>
        <WorldRecords scores={scores ?? []} />
      </main>
    );
  }

  // Rankings tab: server-side filtering + pagination
  const page = Math.max(1, parseInt(params.page) || 1);
  const size = VALID_SIZES.includes(parseInt(params.size)) ? parseInt(params.size) : 25;
  const last = params.last === "1";

  let q = supabase
    .from("score_rankings")
    .select("id, profile_id, round_name, score, golds, shot_at, bow_type, age_category, best_classification, full_name, gender, club_name", { count: "exact" })
    .order("shot_at", { ascending: false });

  if (params.bow)    q = q.eq("bow_type", params.bow);
  if (params.age)    q = q.in("age_category", params.age === "Junior" ? JUNIOR_AGES : [params.age]);
  if (params.gender) q = q.eq("gender", params.gender);
  if (params.gov)    q = q.eq("gov_body", params.gov);
  if (params.rounds) q = q.in("round_name", params.rounds.split(","));

  let rows, total;
  if (last) {
    // Fetch all filtered rows, dedup by latest score per archer per round
    const { data } = await q;
    const seen = new Set();
    const deduped = [];
    for (const s of data ?? []) {
      const key = `${s.profile_id}:${s.round_name}`;
      if (!seen.has(key)) { seen.add(key); deduped.push(s); }
    }
    total = deduped.length;
    rows = deduped.slice((page - 1) * size, page * size);
  } else {
    q = q.range((page - 1) * size, page * size - 1);
    const { data, count } = await q;
    rows = data ?? [];
    total = count ?? 0;
  }

  const rankedRows = rows.map((s, i) => ({ ...s, _rank: (page - 1) * size + i + 1 }));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-0 p-4 md:p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">🌍 World Rankings</h1>
        <p className="text-sm opacity-60">{total} scores</p>
      </div>
      <div className="tab-nav">
        <a href="/world-rankings" className="active">Rankings</a>
        <a href="/world-rankings?tab=records">World records</a>
      </div>
      <RankingsScores rows={rankedRows} total={total} page={page} size={size} params={{ ...params }} />
    </main>
  );
}
