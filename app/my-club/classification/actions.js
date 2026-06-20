"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LBL } from "@/lib/classification";

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

// ── Score classification edits ───────────────────────────────────────────────

export async function updateScoreClassification(scoreId, classification, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);
  await supabase.from("scores").update({ classification }).eq("id", scoreId);
  revalidatePath("/my-club");
}

export async function bulkUpdateClassifications(updates, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50);
    await Promise.all(
      batch.map(u => supabase.from("scores").update({ classification: u.classification }).eq("id", u.id))
    );
  }
  revalidatePath("/my-club");
  return { updated: updates.length };
}

// ── Threshold management ─────────────────────────────────────────────────────

export async function saveThreshold(bow_type, age_category, gender, round_name, thresholds, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);

  const { error } = await supabase.from("classification_thresholds")
    .upsert({ bow_type, age_category, gender, round_name, thresholds, updated_at: new Date().toISOString() },
      { onConflict: "bow_type,age_category,gender,round_name" });

  if (error) throw new Error(error.message);
  revalidatePath("/my-club");
  return { ok: true };
}

export async function deleteThresholdRow(id, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);
  await supabase.from("classification_thresholds").delete().eq("id", id);
  revalidatePath("/my-club");
}

// Auto-sync: recalculate classifications for all club member scores affected by
// a threshold change (matched by bow_type, age_category key, gender, round_name).
export async function autoSyncThreshold(bow_type, age_category, gender, round_name, thresholds, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);

  // Get club member profile IDs
  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, profiles(gender, age_category)")
    .eq("club_id", clubId);

  if (!members?.length) return { synced: 0 };

  // Filter to members whose gender + age_category map to this threshold key
  const AGE_MAP = {
    Senior: (c) => !["U12","U14","U15","U16","U18","50+","60+"].includes(c),
    "50+":  (c) => c === "50+" || c === "60+",
    U18: (c) => c === "U18",
    U16: (c) => c === "U16",
    U15: (c) => c === "U15",
    U14: (c) => c === "U14",
    U12: (c) => c === "U12",
  };
  const genderLabel = gender === "men" ? "Male" : "Female";
  const ageMatch = AGE_MAP[age_category] ?? (() => false);

  const targetProfiles = members
    .filter(m => m.profiles?.gender === genderLabel && ageMatch(m.profiles?.age_category ?? "Senior"))
    .map(m => m.profile_id);

  if (!targetProfiles.length) return { synced: 0 };

  // Fetch their scores for this round + bow
  const { data: scores } = await supabase
    .from("scores")
    .select("id, score")
    .eq("bow_type", bow_type)
    .eq("round_name", round_name)
    .in("profile_id", targetProfiles);

  if (!scores?.length) return { synced: 0 };

  // Recalculate directly from thresholds (bypass ageKey mapping — we already filtered profiles)
  function applyThresholds(score) {
    let best = null;
    for (let i = 0; i < thresholds.length; i++) {
      if (thresholds[i] !== null && score >= thresholds[i]) best = LBL[i];
    }
    return best;
  }

  const updates = scores.map(s => ({ id: s.id, classification: applyThresholds(s.score) }));

  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50);
    await Promise.all(batch.map(u =>
      supabase.from("scores").update({ classification: u.classification }).eq("id", u.id)
    ));
  }

  revalidatePath("/my-club");
  return { synced: updates.length };
}
