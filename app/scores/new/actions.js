"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROUNDS, maxScore } from "@/lib/rounds";

const VALID_STATUSES = ["Practice", "Competition", "Record Attempt"];
const VALID_AGE_CATEGORIES = ["U12", "U14", "U15", "U16", "U18", "Senior", "50+", "60+"];

export async function addScore(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Validate round
  const roundName = formData.get("round_name");
  if (!ROUNDS[roundName]) redirect("/scores/new");

  // Validate score is an integer within the round's maximum
  const score = Number(formData.get("score"));
  const max = maxScore(roundName);
  if (!Number.isInteger(score) || score < 0 || score > max) redirect("/scores/new");

  // Validate golds (if provided) don't exceed total arrows
  const goldsRaw = formData.get("golds");
  const golds = goldsRaw ? Number(goldsRaw) : null;
  const maxArrows = ROUNDS[roundName].ends * ROUNDS[roundName].arrowsPerEnd;
  if (golds !== null && (!Number.isInteger(golds) || golds < 0 || golds > maxArrows)) redirect("/scores/new");

  // Validate date — must be a real date, not in the future
  const shotAt = formData.get("shot_at");
  const shotDate = new Date(shotAt);
  if (isNaN(shotDate.getTime()) || shotDate > new Date()) redirect("/scores/new");

  // Allowlist status and age category
  const status = VALID_STATUSES.includes(formData.get("status")) ? formData.get("status") : "Practice";
  const ageCategory = VALID_AGE_CATEGORIES.includes(formData.get("age_category")) ? formData.get("age_category") : null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("bow_type")
    .eq("id", user.id)
    .single();

  const clubId = formData.get("club_id") || null;
  const bowType = formData.get("bow_type") || profile?.bow_type || null;

  // Find active setup for this bow type to link the score
  const { data: activeSetup } = bowType ? await supabase
    .from("bow_setups")
    .select("id")
    .eq("profile_id", user.id)
    .eq("bow_type", bowType)
    .eq("is_active", true)
    .limit(1)
    .single() : { data: null };

  await supabase.from("scores").insert({
    profile_id: user.id,
    club_id: clubId,
    round_name: roundName,
    score,
    golds,
    shot_at: shotAt,
    status,
    bow_type: bowType,
    age_category: ageCategory,
    setup_id: activeSetup?.id || null,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
