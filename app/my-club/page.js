import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubScores from "./ClubScores";
import ClubRecords from "./ClubRecords";

export default async function MyClubPage({ searchParams }) {
  const { tab = "scores" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find user's club membership
  const { data: membership } = await supabase
    .from("club_members")
    .select("club_id, clubs(id, name)")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
        <h1 className="text-2xl font-semibold">My club</h1>
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-4xl">🏛️</span>
          <p className="text-lg font-medium">You&apos;re not linked to a club yet.</p>
          <p className="max-w-sm text-sm opacity-60">
            Join a club from your profile to see your club&apos;s scores and records here.
          </p>
          <Link href="/profile" className="btn-primary mt-2">Go to profile</Link>
        </div>
      </main>
    );
  }

  const clubId = membership.club_id;
  const clubName = membership.clubs?.name ?? "My club";

  // Fetch all club members + their profile info
  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, profiles(id, full_name, gender)")
    .eq("club_id", clubId);

  const memberIds = (members || []).map((m) => m.profile_id);
  const profileMap = Object.fromEntries(
    (members || []).map((m) => [m.profile_id, m.profiles])
  );

  // Fetch all scores for club members
  const { data: rawScores } = await supabase
    .from("scores")
    .select("id, profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
    .in("profile_id", memberIds.length ? memberIds : ["__none__"])
    .order("shot_at", { ascending: false });

  const scores = (rawScores || []).map((s) => ({
    ...s,
    full_name: profileMap[s.profile_id]?.full_name || "Unknown",
    gender: profileMap[s.profile_id]?.gender || null,
  }));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-0 p-4 md:p-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{clubName}</h1>
          <p className="text-sm opacity-60">{memberIds.length} member{memberIds.length !== 1 ? "s" : ""} · {scores.length} score{scores.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="tab-nav">
        <Link href="/my-club" className={tab === "scores" ? "active" : ""}>Scores</Link>
        <Link href="/my-club?tab=records" className={tab === "records" ? "active" : ""}>Club records</Link>
      </div>

      {tab === "records" ? (
        <ClubRecords scores={scores} clubName={clubName} />
      ) : (
        <ClubScores scores={scores} clubName={clubName} />
      )}
    </main>
  );
}
