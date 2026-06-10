"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClub(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = formData.get("name");
  const location = formData.get("location") || null;
  if (!name) return;

  await supabase.from("clubs").insert({ name, location, created_by: user.id });
  revalidatePath("/clubs");
}

export async function joinClub(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const clubId = formData.get("clubId");
  if (!clubId) return;

  await supabase.from("club_members").insert({ club_id: clubId, profile_id: user.id });
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${clubId}`);
}
