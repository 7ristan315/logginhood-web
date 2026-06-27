import { createClient } from "@/lib/supabase/server";
import ClubsClient from "./ClubsClient";

export default async function ClubsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: clubs }, { data: governingBodies }] = await Promise.all([
    supabase.from("clubs").select("id, name, location, status, governing_bodies(name)").order("name"),
    supabase.from("governing_bodies").select("id, name").order("name"),
  ]);

  let memberClubIds = [];
  let pendingClubIds = [];
  if (user) {
    const { data: memberships } = await supabase.from("club_members").select("club_id, status").eq("profile_id", user.id);
    memberClubIds = (memberships ?? []).filter(m => m.status === "approved").map(m => m.club_id);
    pendingClubIds = (memberships ?? []).filter(m => m.status === "pending").map(m => m.club_id);
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Clubs</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Find and join an archery club</p>
      </div>
      <ClubsClient
        clubs={clubs || []}
        governingBodies={governingBodies || []}
        user={user}
        memberClubIds={memberClubIds}
        pendingClubIds={pendingClubIds}
      />
    </main>
  );
}
