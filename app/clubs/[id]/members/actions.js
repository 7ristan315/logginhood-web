"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROLES, can } from "@/lib/permissions";

async function requireClubPermission(supabase, clubId, permission) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase.from("club_members").select("role").eq("club_id", clubId).eq("profile_id", user.id).eq("status", "approved").single(),
    supabase.from("profiles").select("platform_admin").eq("id", user.id).single(),
  ]);

  if (!profile?.platform_admin && !can(membership?.role, permission)) return null;
  return user;
}

export async function updateMemberRole(formData) {
  const supabase = await createClient();
  const clubId = formData.get("clubId");
  const profileId = formData.get("profileId");
  const role = formData.get("role");

  if (!clubId || !profileId || !ROLES.includes(role)) return;

  const caller = await requireClubPermission(supabase, clubId, "manageMembers");
  if (!caller) return;

  await supabase
    .from("club_members")
    .update({ role })
    .eq("club_id", clubId)
    .eq("profile_id", profileId);

  revalidatePath(`/clubs/${clubId}/members`);
  revalidatePath(`/clubs/${clubId}`);
}

export async function removeMember(formData) {
  const supabase = await createClient();
  const clubId = formData.get("clubId");
  const profileId = formData.get("profileId");

  if (!clubId || !profileId) return;

  const caller = await requireClubPermission(supabase, clubId, "manageMembers");
  if (!caller) return;

  await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("profile_id", profileId);

  revalidatePath(`/clubs/${clubId}/members`);
  revalidatePath(`/clubs/${clubId}`);
}
