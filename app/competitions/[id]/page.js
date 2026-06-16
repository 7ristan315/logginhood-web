import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Trophy from "@/components/ui/Trophy";
import { enterCompetition, withdrawEntry, awardTrophies } from "./actions";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function StatusPill({ comp }) {
  const today = new Date().toISOString().slice(0, 10);
  let label, cls;
  if (comp.status === "cancelled") {
    label = "Cancelled"; cls = "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300";
  } else if (comp.trophies_awarded || comp.status === "completed") {
    label = "Completed"; cls = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  } else if (comp.end_date < today) {
    label = "Ended — awaiting results"; cls = "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
  } else if (comp.start_date <= today) {
    label = "Active — accepting scores"; cls = "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300";
  } else {
    label = "Upcoming"; cls = "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
  }
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>{label}</span>;
}

export default async function CompetitionDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: comp } = await supabase
    .from("competitions")
    .select(`
      id, name, description, round_name, bow_type, start_date, end_date,
      max_entries, has_prizes, trophies_awarded, status, created_at,
      host:profiles!host_id(id, full_name),
      clubs(name)
    `)
    .eq("id", id)
    .single();

  if (!comp) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("platform_admin, bow_type")
    .eq("id", user.id)
    .single();

  // Leaderboard — all entries with profile info
  const { data: entries } = await supabase
    .from("competition_entries")
    .select("id, profile_id, score, bow_type, notes, entered_at, profiles(full_name, club_id)")
    .eq("competition_id", id)
    .order("score", { ascending: false })
    .order("entered_at", { ascending: true });

  // Fetch club names for entries
  const clubIds = [...new Set((entries ?? []).map((e) => e.profiles?.club_id).filter(Boolean))];
  const { data: clubRows } = clubIds.length
    ? await supabase.from("clubs").select("id, name").in("id", clubIds)
    : { data: [] };
  const clubMap = Object.fromEntries((clubRows ?? []).map((c) => [c.id, c.name]));

  // Rank entries (same score + earlier entry = same rank)
  const ranked = [];
  let rank = 1;
  for (let i = 0; i < (entries ?? []).length; i++) {
    if (i > 0 && entries[i].score !== entries[i - 1].score) rank = i + 1;
    ranked.push({ ...entries[i], _rank: rank });
  }

  // My entry
  const myEntry = (entries ?? []).find((e) => e.profile_id === user.id);

  // Trophies if awarded
  const { data: trophies } = comp.trophies_awarded
    ? await supabase
        .from("trophies")
        .select("position, profiles(full_name)")
        .eq("competition_id", id)
        .order("position")
    : { data: [] };

  const today = new Date().toISOString().slice(0, 10);
  const isActive = comp.start_date <= today && today <= comp.end_date && comp.status !== "cancelled";
  const hasEnded = today > comp.end_date;
  const isHost = comp.host?.id === user.id || profile?.platform_admin;
  const canAward = isHost && hasEnded && comp.has_prizes && !comp.trophies_awarded && ranked.length >= 1;

  const bowTypes = ["Recurve", "Compound", "Barebow", "Longbow"];
  const defaultBow = comp.bow_type ?? profile?.bow_type ?? "";

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
      {/* Back */}
      <Link href="/competitions" className="text-sm opacity-60 hover:opacity-100">← All competitions</Link>

      {/* Hero */}
      <div className="card flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusPill comp={comp} />
              {comp.has_prizes && <span className="text-xl" title="Trophies awarded">🏆</span>}
            </div>
            <h1 className="text-2xl font-bold">{comp.name}</h1>
            {comp.description && (
              <p className="mt-2 text-sm opacity-70">{comp.description}</p>
            )}
          </div>
          {isHost && (
            <span className="shrink-0 rounded-full bg-accent-light px-2 py-0.5 text-xs font-semibold" style={{ color: "var(--accent)" }}>
              Your competition
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Round", value: comp.round_name },
            { label: "Bow type", value: comp.bow_type ?? "All" },
            { label: "Opens", value: formatDate(comp.start_date) },
            { label: "Closes", value: formatDate(comp.end_date) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.03)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-50">{label}</p>
              <p className="mt-0.5 text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm opacity-60">
          <span>Hosted by</span>
          <span className="font-medium opacity-100">{comp.host?.full_name}</span>
          {comp.clubs?.name && <span>· {comp.clubs.name}</span>}
          {comp.max_entries && <span>· Max {comp.max_entries} entries</span>}
        </div>
      </div>

      {/* Trophy podium — after award */}
      {comp.trophies_awarded && trophies?.length > 0 && (
        <div className="card flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold">🏆 Results</h2>
          <div className="flex items-end gap-6 justify-center">
            {/* Podium order: 2nd, 1st, 3rd */}
            {[trophies[1], trophies[0], trophies[2]].map((t, i) => {
              if (!t) return <div key={i} className="w-20" />;
              const pos = i === 0 ? 2 : i === 1 ? 1 : 3;
              const heights = ["h-16", "h-24", "h-12"];
              return (
                <div key={t.position} className="flex flex-col items-center gap-2">
                  <Trophy position={pos} size={pos === 1 ? "lg" : "md"} />
                  <p className="text-sm font-semibold text-center max-w-[100px] truncate">{t.profiles?.full_name}</p>
                  <div
                    className={`w-20 ${heights[i]} rounded-t-lg flex items-center justify-center`}
                    style={{ background: "var(--accent-light)" }}
                  >
                    <span className="text-2xl">{MEDALS[pos - 1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leaderboard */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-base font-semibold">Leaderboard <span className="text-sm font-normal opacity-50">({ranked.length} {ranked.length === 1 ? "entry" : "entries"})</span></h2>
          {ranked.length === 0 ? (
            <div className="card py-10 text-center opacity-50 text-sm">No entries yet. Be the first!</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--accent-light)" }}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--accent-light)", background: "var(--accent-light)" }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60 w-10">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Archer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Club</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Bow</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide opacity-60">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((e) => {
                    const isMe = e.profile_id === user.id;
                    const medal = e._rank <= 3 ? MEDALS[e._rank - 1] : null;
                    return (
                      <tr
                        key={e.id}
                        style={{
                          borderBottom: "1px solid var(--accent-light)",
                          background: isMe ? "var(--accent-light)" : undefined,
                        }}
                      >
                        <td className="px-4 py-3 text-sm tabular-nums opacity-50">
                          {medal ?? e._rank}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {e.profiles?.full_name ?? "—"}
                          {isMe && <span className="ml-2 text-xs opacity-50">(you)</span>}
                        </td>
                        <td className="px-4 py-3 text-sm opacity-60">
                          {e.profiles?.club_id ? (clubMap[e.profiles.club_id] ?? "—") : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm opacity-60">{e.bow_type ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: "var(--accent)" }}>
                          {e.score}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar: enter / my entry / award */}
        <div className="flex flex-col gap-4">
          {/* Enter / update score */}
          {isActive && (
            <div className="card flex flex-col gap-4">
              <h2 className="text-base font-semibold">
                {myEntry ? "Update your score" : "Enter this competition"}
              </h2>
              <form action={enterCompetition} className="flex flex-col gap-3">
                <input type="hidden" name="competition_id" value={comp.id} />
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Your score <span className="text-red-500">*</span>
                  <input
                    type="number"
                    name="score"
                    required
                    min={0}
                    max={9999}
                    defaultValue={myEntry?.score ?? ""}
                    className="input-field font-normal"
                    placeholder="e.g. 432"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Bow type
                  <select name="bow_type" defaultValue={myEntry?.bow_type ?? defaultBow} className="input-field font-normal">
                    <option value="">— Select —</option>
                    {(comp.bow_type ? [comp.bow_type] : bowTypes).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Notes
                  <input
                    name="notes"
                    defaultValue={myEntry?.notes ?? ""}
                    placeholder="e.g. outdoor field, windy day"
                    className="input-field font-normal"
                    maxLength={200}
                  />
                </label>
                <button type="submit" className="btn-primary">
                  {myEntry ? "Update score" : "Submit score"}
                </button>
              </form>

              {myEntry && (
                <form action={withdrawEntry}>
                  <input type="hidden" name="competition_id" value={comp.id} />
                  <button type="submit" className="text-xs text-red-500 hover:underline">
                    Withdraw my entry
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Not yet open */}
          {!isActive && !hasEnded && comp.status !== "cancelled" && (
            <div className="card text-sm opacity-60 text-center py-6">
              <p className="text-2xl mb-2">⏳</p>
              <p>Competition opens {formatDate(comp.start_date)}</p>
            </div>
          )}

          {/* Host: award trophies */}
          {canAward && (
            <div className="card flex flex-col gap-3" style={{ borderLeft: "3px solid var(--accent)" }}>
              <div>
                <h2 className="font-semibold">Award trophies</h2>
                <p className="text-xs opacity-60 mt-0.5">
                  This will give gold, silver &amp; bronze trophies to the top 3 scorers.
                </p>
              </div>
              <form action={awardTrophies}>
                <input type="hidden" name="competition_id" value={comp.id} />
                <button type="submit" className="btn-primary w-full">
                  🏆 Award trophies &amp; finalise
                </button>
              </form>
            </div>
          )}

          {/* Info card */}
          <div className="card text-xs opacity-60 flex flex-col gap-1">
            <p>📋 Round: <strong className="opacity-100">{comp.round_name}</strong></p>
            {comp.bow_type && <p>🏹 Restricted to: <strong className="opacity-100">{comp.bow_type}</strong></p>}
            {comp.max_entries && <p>👥 Max entries: <strong className="opacity-100">{comp.max_entries}</strong></p>}
            <p>🏆 Prizes: <strong className="opacity-100">{comp.has_prizes ? "Yes — virtual trophies" : "No"}</strong></p>
          </div>
        </div>
      </div>
    </main>
  );
}
