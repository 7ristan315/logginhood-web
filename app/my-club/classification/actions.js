"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const OFFICER_ROLES = ["chairman","secretary","records_keeper"];

async function assertOfficer(supabase, clubId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("club_members")
    .select("role")
    .eq("club_id", clubId)
    .eq("profile_id", user.id)
    .single();
  if (!OFFICER_ROLES.includes(data?.role)) throw new Error("Not authorised");
  return user;
}

export async function updateScoreClassification(scoreId, classification, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);
  await supabase.from("scores").update({ classification }).eq("id", scoreId);
  revalidatePath("/my-club");
}

// updates: [{id, classification}]
export async function bulkUpdateClassifications(updates, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);
  // Batch in groups of 50
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50);
    await Promise.all(
      batch.map(u => supabase.from("scores").update({ classification: u.classification }).eq("id", u.id))
    );
  }
  revalidatePath("/my-club");
  return { updated: updates.length };
}
