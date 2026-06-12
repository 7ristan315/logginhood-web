"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveApplication(formData) {
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
    .update({ status: "approved" })
    .eq("club_id", clubId)
    .eq("profile_id", profileId);

  revalidatePath(`/clubs/${clubId}/applications`);
  revalidatePath(`/clubs/${clubId}/members`);
  revalidatePath(`/clubs/${clubId}`);
}

export async function rejectApplication(formData) {
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

  revalidatePath(`/clubs/${clubId}/applications`);
  revalidatePath(`/clubs/${clubId}/members`);
  revalidatePath(`/clubs/${clubId}`);
}
