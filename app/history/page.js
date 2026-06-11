import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { normPct } from "@/lib/rounds";
import TabNav from "@/components/TabNav";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: scores } = await supabase
    .from("scores")
    .select("id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
    .eq("profile_id", user.id)
    .order("shot_at", { ascending: false });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <TabNav />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">History</h1>
        <Link href="/scores/new" className="btn-primary">
          Add a score
        </Link>
      </div>

      {!scores?.length ? (
        <p className="text-gray-600">
          No rounds saved yet. <Link href="/scores/new" className="underline">Log your first round</Link>.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {scores.map((s) => {
            const pct = normPct(s.score, s.round_name);
            return (
              <Link
                key={s.id}
                href={`/history/${s.id}`}
                className="card flex items-center justify-between gap-4 hover:opacity-90"
              >
                <div>
                  <div className="font-medium">{s.round_name}</div>
                  <div className="text-sm opacity-70">
                    {s.shot_at} · {s.status}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.classification && s.classification !== "—" && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      {s.classification}
                    </span>
                  )}
                  <div className="text-right">
                    <div className="text-lg font-semibold">{s.score}</div>
                    <div className="text-xs opacity-70">{pct != null ? `${pct}%` : ""}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
