import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUNDS, maxScore, normPct } from "@/lib/rounds";

export default async function HistoryDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: s } = await supabase
    .from("scores")
    .select("id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!s) notFound();

  const round = ROUNDS[s.round_name];
  const max = maxScore(s.round_name);
  const pct = normPct(s.score, s.round_name);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <Link href="/history" className="text-sm hover:text-accent">&larr; Back to history</Link>
      <h1 className="text-2xl font-semibold">{s.round_name}</h1>
      <p className="text-sm opacity-70">{s.shot_at} · {s.status}</p>

      <div className="card flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="text-sm opacity-70">Score</span>
          <span className="text-2xl font-semibold">
            {s.score}{max ? ` / ${max}` : ""}
          </span>
        </div>
        {pct != null && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm opacity-70">Percentage</span>
            <span className="text-lg font-medium">{pct}%</span>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <span className="text-sm opacity-70">Golds</span>
          <span className="text-lg font-medium">{s.golds ?? "—"}</span>
        </div>
      </div>

      <div className="card flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="text-sm opacity-70">Bow type</span>
          <span>{s.bow_type ?? "—"}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm opacity-70">Age category</span>
          <span>{s.age_category ?? "—"}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm opacity-70">Classification</span>
          <span>{s.classification ?? "—"}</span>
        </div>
        {round && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm opacity-70">Distance</span>
            <span>{round.distance}</span>
          </div>
        )}
        {round && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm opacity-70">Format</span>
            <span>{round.ends} ends &times; {round.arrowsPerEnd} arrows</span>
          </div>
        )}
      </div>
    </main>
  );
}
