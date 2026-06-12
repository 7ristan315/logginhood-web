"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/permissions";

export async function updateMemberRole(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const clubId = formData.get("clubId");
  const profileId = formData.get("profileId");
  const role = formData.get("role");
  if (!clubId || !profileId || !ROLES.includes(role)) return;

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const clubId = formData.get("clubId");
  const profileId = formData.get("profileId");
  if (!clubId || !profileId) return;

  await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("profile_id", profileId);

  revalidatePath(`/clubs/${clubId}/members`);
  revalidatePath(`/clubs/${clubId}`);
}
