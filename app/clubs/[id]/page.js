import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { roleLabel } from "@/lib/permissions";

export default async function ClubPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, location, status, affiliation_number, governing_bodies(name)")
    .eq("id", id)
    .single();

  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, role, profiles(full_name)")
    .eq("club_id", id);

  const { data: scores } = await supabase
    .from("scores")
    .select("score, round_name, shot_at, bow_type, age_category, classification, profile_id, profiles(full_name)")
    .eq("club_id", id)
    .order("score", { ascending: false })
    .limit(20);

  if (!club) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>Club not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div className="flex flex-wrap items-end justify-between gap-2 border-l-4 border-accent pl-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{club.name}</h1>
            {club.status === "verified" ? (
              <Badge variant="success">✅ Verified</Badge>
            ) : club.status === "pending" ? (
              <Badge variant="warning">Pending review</Badge>
            ) : null}
          </div>
          {club.location && <p className="text-gray-600">{club.location}</p>}
          {club.governing_bodies?.name && (
            <p className="text-sm opacity-60">
              {club.governing_bodies.name}
              {club.affiliation_number && ` · Affiliation #${club.affiliation_number}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/clubs/${club.id}/members`} className="btn-secondary text-sm">
            🧑‍🤝‍🧑 Members
          </Link>
          <Link href={`/clubs/${club.id}/records`} className="btn-secondary text-sm">
            🏆 Records
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-medium">Members ({members?.length ?? 0})</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {members?.map((m) => (
            <li key={m.profile_id} className="flex items-center gap-2">
              {m.profiles?.full_name ?? "Unnamed archer"}
              {m.role !== "member" && <Badge variant={m.role === "chairman" ? "info" : "default"}>{roleLabel(m.role)}</Badge>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-medium">Leaderboard (top scores)</h2>
        {!scores?.length ? (
          <p className="text-sm text-gray-600">No scores logged for this club yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Archer</th>
                <th className="py-2">Round</th>
                <th className="py-2">Score</th>
                <th className="py-2">Bow</th>
                <th className="py-2">Age cat.</th>
                <th className="py-2">Class</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{s.profiles?.full_name ?? "Unnamed archer"}</td>
                  <td className="py-2">{s.round_name}</td>
                  <td className="py-2">{s.score}</td>
                  <td className="py-2">{s.bow_type ?? "—"}</td>
                  <td className="py-2">{s.age_category ?? "—"}</td>
                  <td className="py-2">{s.classification ?? "—"}</td>
                  <td className="py-2">{s.shot_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
