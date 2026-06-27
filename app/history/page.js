import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HistoryList from "./HistoryList";

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
    <main className="mx-auto flex max-w-5xl flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>All your scored rounds</p>
        </div>
        <Link href="/scores/new" className="btn-primary">
          + Add a score
        </Link>
      </div>

      {!scores?.length ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">🏹</span>
          <p className="font-medium">No rounds saved yet</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <Link href="/scores/new" className="underline" style={{ color: "var(--accent)" }}>Log your first round</Link> to start tracking your progress.
          </p>
        </div>
      ) : (
        <HistoryList scores={scores} />
      )}
    </main>
  );
}
