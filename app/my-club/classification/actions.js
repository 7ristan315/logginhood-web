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
  const { data: score } = await supabase.from("scores").select("club_id").eq("id", scoreId).single();
  if (!score || score.club_id !== clubId) return;
  await supabase.from("scores").update({ classification }).eq("id", scoreId);
  revalidatePath("/my-club");
}

export async function bulkUpdateClassifications(updates, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50);
    await Promise.all(
      batch.map(u => supabase.from("scores").update({ classification: u.classification }).eq("id", u.id).eq("club_id", clubId))
    );
  }
  revalidatePath("/my-club");
  return { updated: updates.length };
}

// ── Threshold management ─────────────────────────────────────────────────────

// Save threshold + record in history table (so we can always look up what the
// thresholds were on any given date and re-apply by date range).
export async function saveThreshold(bow_type, age_category, gender, round_name, thresholds, effective_from, clubId) {
  const supabase = await createClient();
  const user = await assertOfficer(supabase, clubId);

  const [upsertRes, histRes] = await Promise.all([
    supabase.from("classification_thresholds")
      .upsert(
        { bow_type, age_category, gender, round_name, thresholds, updated_at: new Date().toISOString() },
        { onConflict: "bow_type,age_category,gender,round_name" }
      ),
    supabase.from("classification_threshold_history")
      .insert({ bow_type, age_category, gender, round_name, thresholds, effective_from, created_by: user.id }),
  ]);

  if (upsertRes.error) throw new Error(upsertRes.error.message);
  revalidatePath("/my-club");
  return { ok: true };
}

export async function deleteThresholdRow(id, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);
  await supabase.from("classification_thresholds").delete().eq("id", id);
  revalidatePath("/my-club");
}

// ── Sync scores against updated thresholds ───────────────────────────────────
//
// effective_from: ISO date string — only update scores shot on or after this date.
//                 Pass null to update ALL scores (records keeper override).
export async function syncThreshold(bow_type, age_category, gender, round_name, thresholds, effective_from, clubId) {
  const supabase = await createClient();
  await assertOfficer(supabase, clubId);

  // Resolve which member profiles match this bow/age/gender combination
  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, profiles(gender, age_category)")
    .eq("club_id", clubId);

  if (!members?.length) return { synced: 0 };

  const AGE_MAP = {
    Senior: (c) => !["U12","U14","U15","U16","U18","50+","60+"].includes(c),
    "50+":  (c) => c === "50+" || c === "60+",
    U18:    (c) => c === "U18",
    U16:    (c) => c === "U16",
    U15:    (c) => c === "U15",
    U14:    (c) => c === "U14",
    U12:    (c) => c === "U12",
  };
  const genderLabel = gender === "men" ? "Male" : "Female";
  const ageMatch    = AGE_MAP[age_category] ?? (() => false);

  const targetProfiles = members
    .filter(m => m.profiles?.gender === genderLabel && ageMatch(m.profiles?.age_category ?? "Senior"))
    .map(m => m.profile_id);

  if (!targetProfiles.length) return { synced: 0 };

  // Fetch affected scores, optionally filtered by effective_from date
  let query = supabase
    .from("scores")
    .select("id, score")
    .eq("bow_type", bow_type)
    .eq("round_name", round_name)
    .in("profile_id", targetProfiles);

  if (effective_from) query = query.gte("shot_at", effective_from);

  const { data: scores } = await query;
  if (!scores?.length) return { synced: 0 };

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
