import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubScores from "./ClubScores";
import ClubRecords from "./ClubRecords";
import CalendarTab from "./CalendarTab";
import TrophiesTab from "./TrophiesTab";
import BadgesTab from "./BadgesTab";
import BadgeAdminTab from "./BadgeAdminTab";
import ClassificationAuditTab from "./ClassificationAuditTab";

export default async function MyClubPage({ searchParams }) {
  const { tab = "scores" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find user's club membership
  const { data: membership } = await supabase
    .from("club_members")
    .select("club_id, role, clubs(id, name)")
    .eq("profile_id", user.id)
    .limit(1)
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
  const userRole = membership.role;
  const clubName = membership.clubs?.name ?? "My club";

  // Fetch all club members
  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, role, profiles(id, full_name, gender)")
    .eq("club_id", clubId);

  const memberIds = (members || []).map((m) => m.profile_id);
  const profileMap = Object.fromEntries((members || []).map((m) => [m.profile_id, m.profiles]));

  // === Scores & Records ===
  let scores = [];
  if (tab === "scores" || tab === "records") {
    const { data: rawScores } = await supabase
      .from("scores")
      .select("id, profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
      .in("profile_id", memberIds.length ? memberIds : ["__none__"])
      .order("shot_at", { ascending: false });

    scores = (rawScores || []).map((s) => ({
      ...s,
      full_name: profileMap[s.profile_id]?.full_name || "Unknown",
      gender: profileMap[s.profile_id]?.gender || null,
    }));
  }

  // === Calendar ===
  let sessions = [], locations = [], keyholders = [];
  if (tab === "calendar") {
    const sixWeeksAgo = new Date(Date.now() - 42 * 86400000).toISOString().slice(0, 10);

    const [sessRes, locRes, khRes] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, name, location, event_type, description, session_date, start_time, end_time, max_places, is_cancelled, assigned_keyholder_id, session_bookings(profile_id, profiles(full_name))")
        .eq("club_id", clubId)
        .gte("session_date", sixWeeksAgo)
        .order("session_date", { ascending: true }),
      supabase
        .from("club_locations")
        .select("id, name, address, access_notes, is_active")
        .eq("club_id", clubId)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("keyholders")
        .select("id, profile_id, location, profiles(full_name)")
        .eq("club_id", clubId)
        .eq("is_active", true),
    ]);

    sessions  = sessRes.data ?? [];
    locations = locRes.data ?? [];
    keyholders = khRes.data ?? [];
  }

  // === Badges ===
  let userProfile = null, userScores = [], badgeTypes = [], badgeStock = [], badgeOrders = [];
  let isBadgeAdmin = false, adminOrders = [];
  if (tab === "badges" || tab === "badge-admin") {
    const [profRes, scoresRes, btRes, bsRes, boRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, bow_type, age_category, gender").eq("id", user.id).single(),
      supabase.from("scores").select("id, profile_id, round_name, score, bow_type, age_category, shot_at").eq("profile_id", user.id),
      supabase.from("badge_types").select("*").or(`club_id.is.null,club_id.eq.${clubId}`).order("sort_order", { ascending: false }),
      supabase.from("badge_stock").select("*").eq("club_id", clubId),
      supabase.from("badge_orders").select("*").eq("profile_id", user.id).eq("club_id", clubId).order("created_at", { ascending: false }),
    ]);
    userProfile = profRes.data;
    userScores  = scoresRes.data ?? [];
    badgeTypes  = btRes.data ?? [];
    badgeStock  = bsRes.data ?? [];
    badgeOrders = boRes.data ?? [];

    const { data: rolesData } = await supabase
      .from("club_member_roles")
      .select("role")
      .eq("club_id", clubId)
      .eq("profile_id", user.id);
    isBadgeAdmin = (rolesData ?? []).some(r => r.role === "badge_admin")
      || ["admin","chairman","secretary"].includes(userRole);
  }

  if (tab === "badge-admin" && isBadgeAdmin) {
    const { data: ao } = await supabase
      .from("badge_orders")
      .select("*, profiles(full_name), badge_types(label, bow_type, name, default_cost)")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });
    adminOrders = ao ?? [];
  }

  // === Classifications ===
  const isRecordsOfficer = ["records_keeper", "chairman", "secretary"].includes(userRole);
  let clsScores = [];
  if (tab === "classifications" && isRecordsOfficer) {
    const { data: rawCls } = await supabase
      .from("scores")
      .select("id, profile_id, round_name, score, bow_type, age_category, classification")
      .in("profile_id", memberIds.length ? memberIds : ["__none__"])
      .order("shot_at", { ascending: false });
    clsScores = rawCls ?? [];
  }

  // === Trophies ===
  let trophies = [];
  if (tab === "trophies") {
    const { data: t } = await supabase
      .from("trophies")
      .select(`
        id, position, awarded_at, competition_id,
        profiles(full_name),
        competitions(name, round_name)
      `)
      .in("profile_id", memberIds.length ? memberIds : ["__none__"])
      .order("awarded_at", { ascending: false });

    trophies = t ?? [];
  }

  const TABS = [
    { key: "scores",          label: "Scores" },
    { key: "records",         label: "Club records" },
    { key: "calendar",        label: "📅 Calendar" },
    { key: "trophies",        label: "🏆 Trophies" },
    { key: "badges",          label: "🎖️ Badges" },
    ...(isBadgeAdmin ? [{ key: "badge-admin", label: "⚙️ Badge admin" }] : []),
    ...(isRecordsOfficer ? [{ key: "classifications", label: "📊 Classifications" }] : []),
  ];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-0 p-4 md:p-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{clubName}</h1>
          <p className="text-sm opacity-60">
            {memberIds.length} member{memberIds.length !== 1 ? "s" : ""}
            {tab === "scores" ? ` · ${scores.length} scores` : ""}
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="tab-nav">
        {TABS.map((t) => (
          <Link key={t.key} href={`/my-club?tab=${t.key}`} className={tab === t.key ? "active" : ""}>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "records" && <ClubRecords scores={scores} clubName={clubName} />}
      {tab === "scores" && <ClubScores scores={scores} clubName={clubName} />}
      {tab === "calendar" && (
        <CalendarTab
          sessions={sessions}
          clubId={clubId}
          userId={user.id}
          userRole={userRole}
          locations={locations}
          keyholders={keyholders}
          members={members || []}
        />
      )}
      {tab === "trophies" && <TrophiesTab trophies={trophies} />}
      {tab === "badges" && (
        <BadgesTab
          userProfile={userProfile}
          userScores={userScores}
          badgeTypes={badgeTypes}
          badgeStock={badgeStock}
          badgeOrders={badgeOrders}
          clubId={clubId}
        />
      )}
      {tab === "classifications" && isRecordsOfficer && (
        <ClassificationAuditTab scores={clsScores} members={members || []} clubId={clubId} />
      )}
      {tab === "badge-admin" && isBadgeAdmin && (
        <BadgeAdminTab
          badgeTypes={badgeTypes}
          badgeStock={badgeStock}
          adminOrders={adminOrders}
          clubId={clubId}
          members={members}
        />
      )}
    </main>
  );
}
