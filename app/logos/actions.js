"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function vote(formData) {
  const filename = formData.get("filename");
  if (!filename) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("logo_votes").upsert(
    { logo_filename: filename, profile_id: user.id },
    { onConflict: "logo_filename,profile_id", ignoreDuplicates: true }
  );
  revalidatePath("/logos");
}

export async function unvote(formData) {
  const filename = formData.get("filename");
  if (!filename) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("logo_votes")
    .delete()
    .eq("logo_filename", filename)
    .eq("profile_id", user.id);
  revalidatePath("/logos");
}
