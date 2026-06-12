"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("platform_admin")
    .eq("id", user.id)
    .single();

  return profile?.platform_admin ? user : null;
}

export async function reviewClub(formData) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return;

  const clubId = formData.get("clubId");
  const decision = formData.get("decision");
  if (!clubId || !["verified", "rejected"].includes(decision)) return;

  const { data: club } = await supabase
    .from("clubs")
    .update({ status: decision })
    .eq("id", clubId)
    .select("created_by")
    .single();

  if (club?.created_by) {
    if (decision === "verified") {
      await supabase
        .from("club_members")
        .update({ status: "approved" })
        .eq("club_id", clubId)
        .eq("profile_id", club.created_by)
        .eq("role", "chairman");
    } else {
      await supabase
        .from("club_members")
        .delete()
        .eq("club_id", clubId)
        .eq("profile_id", club.created_by)
        .eq("role", "chairman")
        .eq("status", "pending");
    }
  }

  revalidatePath("/admin/clubs");
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${clubId}`);
  revalidatePath(`/clubs/${clubId}/members`);
}
