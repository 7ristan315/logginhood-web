"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addScore(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("bow_type")
    .eq("id", user.id)
    .single();

  const clubId = formData.get("club_id") || null;
  const golds = formData.get("golds");
  const ageCategory = formData.get("age_category");

  await supabase.from("scores").insert({
    profile_id: user.id,
    club_id: clubId,
    round_name: formData.get("round_name"),
    score: Number(formData.get("score")),
    golds: golds ? Number(golds) : null,
    shot_at: formData.get("shot_at"),
    status: formData.get("status") || "Practice",
    bow_type: formData.get("bow_type") || profile?.bow_type || null,
    age_category: ageCategory || null,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
