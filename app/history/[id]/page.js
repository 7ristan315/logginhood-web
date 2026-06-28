import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUNDS, maxScore, normPct } from "@/lib/rounds";
import ScoreDetail from "./ScoreDetail";

export default async function HistoryDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: s } = await supabase
    .from("scores")
    .select("id, round_name, score, golds, shot_at, status, bow_type, age_category, classification, ends")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!s) notFound();

  const round = ROUNDS[s.round_name];
  const max = maxScore(s.round_name);
  const pct = normPct(s.score, s.round_name);

  const totalArrows = round ? round.ends * round.arrowsPerEnd : null;
  let hits = null;
  if (s.ends && Array.isArray(s.ends)) {
    hits = s.ends.reduce((sum, end) => sum + end.arrows.filter(a => a && a !== "M").length, 0);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Link href="/history" className="text-sm hover:text-accent" style={{ color: "var(--accent)", textDecoration: "none" }}>&larr; Back to history</Link>
        <Link href={`/share/${s.id}`} className="btn-primary text-sm">Post my score</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{s.round_name}</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.shot_at} · {s.status}</p>
      </div>

      <ScoreDetail
        score={s.score}
        max={max}
        pct={pct}
        hits={hits}
        totalArrows={totalArrows}
        golds={s.golds}
        ends={s.ends}
        roundName={s.round_name}
        round={round}
      />

      <div className="card flex flex-col gap-2">
        {[
          ["Bow type", s.bow_type],
          ["Age category", s.age_category],
          ["Classification", s.classification],
          round && ["Distance", round.distance],
          round && ["Format", `${round.ends} ends × ${round.arrowsPerEnd} arrows`],
        ].filter(Boolean).map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>
            <span className="font-medium">{value ?? "—"}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
