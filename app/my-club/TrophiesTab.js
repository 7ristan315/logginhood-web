import Trophy from "@/components/ui/Trophy";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };
const POSITION_LABEL = { 1: "Gold", 2: "Silver", 3: "Bronze" };

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

export default function TrophiesTab({ trophies = [] }) {
  if (!trophies.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center opacity-60">
        <span className="text-6xl">🏺</span>
        <div>
          <p className="text-lg font-semibold">No trophies yet</p>
          <p className="text-sm">Enter an online competition to win gold, silver or bronze!</p>
        </div>
      </div>
    );
  }

  // Group by position for headline stats
  const byPos = { 1: 0, 2: 0, 3: 0 };
  for (const t of trophies) byPos[t.position] = (byPos[t.position] ?? 0) + 1;

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((pos) => (
          <div key={pos} className="card flex flex-col items-center gap-2 py-4">
            <Trophy position={pos} size="md" />
            <span className="text-2xl font-bold tabular-nums">{byPos[pos]}</span>
            <span className="text-xs opacity-50">{POSITION_LABEL[pos]}</span>
          </div>
        ))}
      </div>

      {/* All trophies */}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--accent-light)" }}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--accent-light)", background: "var(--accent-light)" }}>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Trophy</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Member</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Competition</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Round</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">Date</th>
            </tr>
          </thead>
          <tbody>
            {trophies.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--accent-light)" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Trophy position={t.position} size="sm" />
                    <span className="text-xs font-semibold opacity-60">{MEDALS[t.position]}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{t.profiles?.full_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <a
                    href={`/competitions/${t.competition_id}`}
                    className="hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {t.competitions?.name ?? "—"}
                  </a>
                </td>
                <td className="px-4 py-3 opacity-60">{t.competitions?.round_name ?? "—"}</td>
                <td className="px-4 py-3 opacity-60">{formatDate(t.awarded_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
