import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import ClassificationTracker from "./ClassificationTracker";

const LBL = ["IA3","IA2","IA1","IB3","IB2","IB1","IMB","IGMB"];

function dateStr(d) { return d.toISOString().slice(0, 10); }

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bow_type, age_category, gender")
    .eq("id", user.id)
    .single();

  const { data: rawScores } = await supabase
    .from("scores")
    .select("id, round_name, score, golds, shot_at, bow_type, age_category, classification, status, arrows_used")
    .eq("profile_id", user.id)
    .order("shot_at", { ascending: false });

  const { data: clsThresholds } = await supabase
    .from("classification_thresholds")
    .select("bow_type, age_category, gender, round_name, thresholds");

  const scores = rawScores || [];

  // ── Personal bests per round+bow ─────────────────────────────────────────
  const pbMap = {};
  for (const s of scores) {
    const key = `${s.round_name}|${s.bow_type}`;
    if (!pbMap[key] || s.score > pbMap[key].score) pbMap[key] = s;
  }
  const pbSet = new Set(Object.values(pbMap).map(s => s.id));
  const personalBests = Object.values(pbMap)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => ({ ...s, shot_at: s.shot_at?.slice(0, 10) }));

  // ── Overall PB ───────────────────────────────────────────────────────────
  const pbScore = scores.reduce((best, s) => (!best || s.score > best.score) ? s : best, null);

  // ── Monthly counts ───────────────────────────────────────────────────────
  const now = new Date();
  const monthStart = dateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  const lastMonthStart = dateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const roundsThisMonth = scores.filter(s => s.shot_at >= monthStart).length;
  const roundsLastMonth = scores.filter(s => s.shot_at >= lastMonthStart && s.shot_at < monthStart).length;

  // ── Best classification ───────────────────────────────────────────────────
  const bestClsScore = scores.reduce((best, s) => {
    if (!s.classification) return best;
    const idx = LBL.indexOf(s.classification);
    const bestIdx = best ? LBL.indexOf(best.classification) : -1;
    return idx > bestIdx ? s : best;
  }, null);

  // ── Recent sessions with PB flag + diff vs previous same round+bow ───────
  const recentWithDiff = scores.slice(0, 20).map((s, idx) => {
    const older = scores.slice(idx + 1).find(o => o.round_name === s.round_name && o.bow_type === s.bow_type);
    return {
      ...s,
      isPB: pbSet.has(s.id),
      diffVsPrev: older != null ? s.score - older.score : null,
      shot_at: s.shot_at?.slice(0, 10),
    };
  });

  // ── Sparkline: most-shot round+bow combo ─────────────────────────────────
  const freq = {};
  for (const s of scores) {
    const key = `${s.round_name}|${s.bow_type}`;
    freq[key] = (freq[key] || 0) + 1;
  }
  const topKey = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const [sparkRound, sparkBow] = topKey.split("|");
  const sparklineScores = scores
    .filter(s => s.round_name === sparkRound && s.bow_type === sparkBow)
    .slice(0, 12)
    .reverse();
  const sparklineData = sparklineScores.map(s => s.score);
  const sparklineRound = topKey ? `${sparkRound} (${sparkBow})` : "";

  // ── By bow type ───────────────────────────────────────────────────────────
  const bowCounts = {};
  for (const s of scores) bowCounts[s.bow_type] = (bowCounts[s.bow_type] || 0) + 1;
  const maxBow = Math.max(...Object.values(bowCounts), 1);
  const byBow = Object.entries(bowCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([bow, count]) => ({ bow, count, pct: Math.round((count / maxBow) * 100) }));

  // ── Stats object ──────────────────────────────────────────────────────────
  const stats = {
    total: scores.length,
    totalGolds: scores.reduce((n, s) => n + (s.golds || 0), 0),
    pb: pbScore?.score ?? null,
    pbRound: pbScore ? `${pbScore.round_name} · ${pbScore.bow_type}` : null,
    roundsThisMonth,
    monthDiff: roundsLastMonth > 0 || roundsThisMonth > 0 ? roundsThisMonth - roundsLastMonth : null,
    bestCls: bestClsScore?.classification ?? null,
    bestClsBow: bestClsScore?.bow_type ?? null,
    bestClsAge: bestClsScore?.age_category ?? null,
  };

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Archer";
  const hour = new Date().getUTCHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="mx-auto max-w-4xl p-4 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{greeting}, {name.split(" ")[0]} 🏹</h1>
        {scores.length > 0 && (
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {scores.length} rounds logged · last shot {scores[0]?.shot_at?.slice(0, 10)}
          </p>
        )}
      </div>

      {scores.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center" style={{ color: "var(--text-tertiary)" }}>
          <span className="text-5xl">🎯</span>
          <p className="text-lg">No rounds logged yet</p>
          <p className="text-sm">Open the app and shoot your first round to see your stats here.</p>
        </div>
      ) : (
        <>
          <DashboardClient
            stats={stats}
            recentScores={recentWithDiff}
            personalBests={personalBests}
            byBow={byBow}
            sparklineData={sparklineData}
            sparklineRound={sparklineRound}
          />
          <div className="mt-8">
            <ClassificationTracker
              scores={scores}
              thresholds={clsThresholds || []}
              profile={profile}
            />
          </div>
        </>
      )}
    </main>
  );
}
