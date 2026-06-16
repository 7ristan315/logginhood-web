import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_BADGE = {
  upcoming:  { label: "Upcoming",  cls: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
  active:    { label: "Active",    cls: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300" },
};

function deriveStatus(comp) {
  if (comp.status === "cancelled") return "cancelled";
  if (comp.trophies_awarded || comp.status === "completed") return "completed";
  const today = new Date().toISOString().slice(0, 10);
  if (comp.end_date < today) return "completed";
  if (comp.start_date <= today) return "active";
  return "upcoming";
}

function formatDateRange(start, end) {
  const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default async function CompetitionsPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { q = "", status: filterStatus = "" } = await searchParams;

  let query = supabase
    .from("competitions")
    .select(`
      id, name, description, round_name, bow_type, start_date, end_date,
      has_prizes, trophies_awarded, status, created_at,
      host:profiles!host_id(full_name),
      clubs(name)
    `)
    .neq("status", "cancelled")
    .order("start_date", { ascending: false });

  const { data: all } = await query;

  let comps = (all ?? []).map((c) => ({ ...c, _status: deriveStatus(c) }));

  if (q) comps = comps.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  if (filterStatus) comps = comps.filter((c) => c._status === filterStatus);

  // Can this user create competitions?
  const { data: profile } = await supabase
    .from("profiles")
    .select("platform_admin")
    .eq("id", user.id)
    .single();

  const { data: myMemberships } = await supabase
    .from("club_members")
    .select("role")
    .eq("profile_id", user.id);

  const canCreate =
    profile?.platform_admin ||
    (myMemberships ?? []).some((m) => ["coach", "records_keeper", "chairman"].includes(m.role));

  // Entry counts
  const compIds = comps.map((c) => c.id);
  const { data: entryCounts } = compIds.length
    ? await supabase
        .from("competition_entries")
        .select("competition_id")
        .in("competition_id", compIds)
    : { data: [] };

  const countMap = {};
  for (const e of entryCounts ?? []) {
    countMap[e.competition_id] = (countMap[e.competition_id] ?? 0) + 1;
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Competitions</h1>
          <p className="text-sm opacity-60">Online archery competitions — shoot in your own time and submit your score.</p>
        </div>
        {canCreate && (
          <Link href="/competitions/new" className="btn-primary shrink-0 text-sm">
            + Create competition
          </Link>
        )}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search competitions…"
          className="input-field min-w-[200px] flex-1"
        />
        <select name="status" defaultValue={filterStatus} className="input-field">
          <option value="">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(q || filterStatus) && (
          <Link href="/competitions" className="btn-secondary text-sm self-center">Clear</Link>
        )}
      </form>

      {/* Listing */}
      {comps.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-5xl">🏆</span>
          <p className="text-lg font-medium">No competitions found</p>
          <p className="max-w-sm text-sm opacity-60">
            {q || filterStatus ? "Try adjusting your search." : "Be the first to create one!"}
          </p>
          {canCreate && (
            <Link href="/competitions/new" className="btn-primary mt-2">Create competition</Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comps.map((comp) => {
            const badge = STATUS_BADGE[comp._status] ?? STATUS_BADGE.upcoming;
            const entries = countMap[comp.id] ?? 0;
            return (
              <Link
                key={comp.id}
                href={`/competitions/${comp.id}`}
                className="card flex flex-col gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderLeft: "3px solid var(--accent)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {comp.has_prizes && (
                        <span className="text-sm" title="Prizes awarded">🏆</span>
                      )}
                    </div>
                    <h2 className="font-semibold leading-tight">{comp.name}</h2>
                  </div>
                </div>

                {comp.description && (
                  <p className="text-xs opacity-60 line-clamp-2">{comp.description}</p>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className="rounded-full px-2 py-0.5 font-medium"
                    style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                  >
                    {comp.round_name}
                  </span>
                  {comp.bow_type && (
                    <span className="rounded-full px-2 py-0.5 opacity-60" style={{ background: "var(--accent-light)" }}>
                      {comp.bow_type}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-2 border-t pt-2" style={{ borderColor: "var(--accent-light)" }}>
                  <div className="text-xs opacity-60">
                    <p>{formatDateRange(comp.start_date, comp.end_date)}</p>
                    <p className="truncate">{comp.host?.full_name}{comp.clubs?.name ? ` · ${comp.clubs.name}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-xs opacity-50">{entries} {entries === 1 ? "entry" : "entries"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
