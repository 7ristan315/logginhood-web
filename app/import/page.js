import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ImportWizard from "./ImportWizard";

export const metadata = { title: "Import scores — Logginhood" };

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("club_members")
    .select("role, club_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const isOfficer = ["chairman","records_keeper"].includes(membership?.role);

  let members = [];
  if (isOfficer && membership?.club_id) {
    const { data } = await supabase
      .from("club_members")
      .select("profile_id, profiles(full_name)")
      .eq("club_id", membership.club_id)
      .eq("status", "approved");
    members = data || [];
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <ImportWizard userId={user.id} isOfficer={isOfficer} members={members} />
    </div>
  );
}
