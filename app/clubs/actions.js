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
  const governingBodyId = formData.get("governingBodyId") || null;
  const affiliationNumber = formData.get("affiliationNumber") || null;
  const officialEmail = formData.get("officialEmail") || null;
  if (!name) return;

  await supabase.from("clubs").insert({
    name,
    location,
    created_by: user.id,
    governing_body_id: governingBodyId,
    affiliation_number: affiliationNumber,
    official_email: officialEmail,
  });
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
