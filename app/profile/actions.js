"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SOCIAL_PLATFORMS } from "@/lib/social";

export async function updateProfile(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clubId = formData.get("club_id") || null;
  const dob = formData.get("date_of_birth") || null;
  const ageCategory = formData.get("age_category") || null;

  const socialLinks = {};
  for (const platform of SOCIAL_PLATFORMS) {
    const value = formData.get(`social_${platform.key}`);
    if (value) socialLinks[platform.key] = value.trim();
  }

  await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name") || null,
      gb_number: formData.get("gb_number") || null,
      gender: formData.get("gender") || null,
      date_of_birth: dob,
      bow_type: formData.get("bow_type") || null,
      age_category: ageCategory,
      club_id: clubId,
      social_links: socialLinks,
    })
    .eq("id", user.id);

  if (clubId) {
    await supabase
      .from("club_members")
      .upsert(
        { club_id: clubId, profile_id: user.id },
        { onConflict: "club_id,profile_id", ignoreDuplicates: true }
      );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
