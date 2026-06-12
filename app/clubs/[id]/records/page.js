import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecordsFilters from "@/components/RecordsFilters";
import {
  FILTER_FIELDS,
  classificationKey,
  classificationLabel,
  classificationSortValue,
  fieldLabel,
  getFieldValue,
  personalBests,
} from "@/lib/records";

const MEDALS = ["🥇", "🥈", "🥉"];

const SCORE_COLS = "id,profile_id,score,golds,shot_at,status,bow_type,age_category,club_id,profiles(full_name,gender)";

export default async function ClubRecordsPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, location")
    .eq("id", id)
    .single();

  if (!club) notFound();

  // Work out which rounds this club has scores for, so the dropdown only
  // ever shows rounds that actually have data.
  const { data: clubRoundRows } = await supabase
    .from("scores")
    .select("round_name")
    .eq("club_id", id);

  const roundCounts = new Map();
  for (const r of clubRoundRows ?? []) {
    roundCounts.set(r.round_name, (roundCounts.get(r.round_name) ?? 0) + 1);
  }
  const roundOptions = [...roundCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  if (!roundOptions.length) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
        <ClubHeader club={club} />
        <p className="text-sm opacity-70">No scores logged for this club yet.</p>
      </main>
    );
  }

  const selectedRound = roundOptions.some((r) => r.name === sp.round) ? sp.round : roundOptions[0].name;
  const world = sp.world === "1";

  const filters = [];
  for (let i = 1; i <= FILTER_FIELDS.length; i++) {
    const v = sp[`var${i}`];
    const val = sp[`val${i}`];
    if (v && val && FILTER_FIELDS.some((f) => f.key === v && f.options.includes(val))) {
      filters.push({ var: v, val });
    }
  }

  // Scores for the selected round, scoped to this club or the whole world.
  let scoreQuery = supabase.from("scores").select(SCORE_COLS).eq("round_name", selectedRound);
  if (!world) scoreQuery = scoreQuery.eq("club_id", id);
  const { data: rows } = await scoreQuery;
  const allRows = rows ?? [];

  // Resolve club names for the "world" view.
  let clubNames = new Map();
  if (world) {
    const ids = [...new Set(allRows.map((r) => r.club_id).filter(Boolean))];
    if (ids.length) {
      const { data: clubsData } = await supabase.from("clubs").select("id, name").in("id", ids);
      clubNames = new Map((clubsData ?? []).map((c) => [c.id, c.name]));
    }
  }

  const filteredRows = filters.length
    ? allRows.filter((row) => filters.every((f) => getFieldValue(row, f.var) === f.val))
    : allRows;

  // How does this club's best stack up against the world for the current scope?
  let worldRank = null;
  if (world) {
    const pbAll = personalBests(filteredRows);
    const idx = pbAll.findIndex((r) => r.club_id === id);
    if (idx !== -1) {
      worldRank = { rank: idx + 1, total: pbAll.length, gap: pbAll[0].score - pbAll[idx].score };
    }
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-8">
      <ClubHeader club={club} />

      <RecordsFilters
        roundOptions={roundOptions}
        selectedRound={selectedRound}
        world={world}
        filters={filters}
      />

      {world && (
        <div className="card text-sm">
          {worldRank ? (
            <p>
              🏠 <strong>{club.name}</strong>&rsquo;s best for {selectedRound}
              {filters.length ? <> ({filters.map((f) => `${fieldLabel(f.var)}: ${f.val}`).join(", ")})</> : null}{" "}
              ranks <strong>#{worldRank.rank}</strong> of {worldRank.total} worldwide
              {worldRank.gap === 0 ? (
                <> — 🌍 world #1!</>
              ) : (
                <> ({worldRank.gap} points behind world #1)</>
              )}
            </p>
          ) : (
            <p>
              No scores from <strong>{club.name}</strong> for {selectedRound}
              {filters.length ? " with this filter" : ""} yet.
            </p>
          )}
        </div>
      )}

      {filters.length > 0 ? (
        <FilteredTable
          rows={filteredRows}
          title={`Top 10 — ${selectedRound} · ${filters.map((f) => `${fieldLabel(f.var)}: ${f.val}`).join(", ")}`}
          world={world}
          clubNames={clubNames}
        />
      ) : (
        <>
          <RecordCard
            title="Overall"
            subtitle={`Top 5 — ${selectedRound}, any age, gender or bow`}
            rows={personalBests(allRows).slice(0, 5)}
            world={world}
            clubNames={clubNames}
            wide
          />

          <ClassificationGrid rows={allRows} world={world} clubNames={clubNames} />
        </>
      )}
    </main>
  );
}

function ClubHeader({ club }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="border-l-4 border-accent pl-4">
        <h1 className="text-2xl font-semibold">{club.name} — Records</h1>
        {club.location && <p className="text-sm opacity-70">{club.location}</p>}
      </div>
      <Link href={`/clubs/${club.id}`} className="text-sm hover:text-accent">
        &larr; Back to club
      </Link>
    </div>
  );
}

function ClassificationGrid({ rows, world, clubNames }) {
  const groups = new Map();
  for (const row of rows) {
    const key = classificationKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const keys = [...groups.keys()].sort((a, b) => classificationSortValue(a) - classificationSortValue(b));

  if (!keys.length) {
    return <p className="text-sm opacity-70">No scores logged for this round yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {keys.map((key) => (
        <RecordCard
          key={key}
          title={classificationLabel(key)}
          rows={personalBests(groups.get(key)).slice(0, 3)}
          world={world}
          clubNames={clubNames}
        />
      ))}
    </div>
  );
}

function RecordCard({ title, subtitle, rows, world, clubNames, wide }) {
  return (
    <div className={`card flex flex-col gap-2 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <div>
        <h2 className="font-medium">{title}</h2>
        {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
      </div>
      {!rows.length ? (
        <p className="text-sm opacity-60">No scores yet.</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex items-baseline gap-2 truncate">
                <span className="w-5 shrink-0 text-center">{MEDALS[i] ?? `${i + 1}.`}</span>
                <span className="truncate">
                  {r.profiles?.full_name ?? "Unnamed archer"}
                  {world && clubNames.get(r.club_id) && (
                    <span className="ml-1 text-xs opacity-50">· {clubNames.get(r.club_id)}</span>
                  )}
                </span>
              </span>
              <span className="shrink-0 whitespace-nowrap">
                <span className="font-semibold">{r.score}</span>
                <span className="ml-2 text-xs opacity-50">{r.shot_at}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FilteredTable({ rows, title, world, clubNames }) {
  const pb = personalBests(rows).slice(0, 10);

  return (
    <div className="card flex flex-col gap-3">
      <h2 className="font-medium">{title}</h2>
      {!pb.length ? (
        <p className="text-sm opacity-60">No scores match this filter yet.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-2 w-10">#</th>
              <th className="py-2 pr-2">Archer</th>
              {world && <th className="py-2 pr-2">Club</th>}
              <th className="py-2 pr-2">Score</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {pb.map((r, i) => (
              <tr key={r.id} className="border-b last:border-none">
                <td className="py-2 pr-2">{MEDALS[i] ?? i + 1}</td>
                <td className="py-2 pr-2">{r.profiles?.full_name ?? "Unnamed archer"}</td>
                {world && <td className="py-2 pr-2">{clubNames.get(r.club_id) ?? "—"}</td>}
                <td className="py-2 pr-2 font-semibold">{r.score}</td>
                <td className="py-2">{r.shot_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
