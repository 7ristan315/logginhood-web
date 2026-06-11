import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TabNav from "@/components/TabNav";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: scores } = await supabase
    .from("scores")
    .select("id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
    .eq("profile_id", user.id)
    .order("shot_at", { ascending: false });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <TabNav />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <Link href="/scores/new" className="btn-primary">
          Add a score
        </Link>
      </div>

      {!scores?.length ? (
        <p className="text-gray-600">
          No scores yet. <Link href="/scores/new" className="underline">Log your first round</Link>.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Date</th>
              <th className="py-2">Round</th>
              <th className="py-2">Score</th>
              <th className="py-2">Golds</th>
              <th className="py-2">Bow</th>
              <th className="py-2">Age cat.</th>
              <th className="py-2">Class</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.shot_at}</td>
                <td className="py-2">{s.round_name}</td>
                <td className="py-2">{s.score}</td>
                <td className="py-2">{s.golds ?? "—"}</td>
                <td className="py-2">{s.bow_type ?? "—"}</td>
                <td className="py-2">{s.age_category ?? "—"}</td>
                <td className="py-2">{s.classification ?? "—"}</td>
                <td className="py-2">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
