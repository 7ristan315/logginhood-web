"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function enterCompetition(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const competition_id = formData.get("competition_id")?.toString();
  const score = parseInt(formData.get("score"));
  const bow_type = formData.get("bow_type")?.toString() || null;
  const notes = formData.get("notes")?.toString().trim().slice(0, 200) || null;

  if (!competition_id || isNaN(score) || score < 0 || score > 1440) {
    revalidatePath(`/competitions/${competition_id}`);
    return;
  }

  // Verify competition is active
  const { data: comp } = await supabase
    .from("competitions")
    .select("start_date, end_date, max_entries, status, bow_type, round_name")
    .eq("id", competition_id)
    .single();

  if (!comp) return;

  const today = new Date().toISOString().slice(0, 10);
  if (today < comp.start_date || today > comp.end_date || comp.status === "cancelled") return;

  // Bow type restriction
  if (comp.bow_type && bow_type !== comp.bow_type) return;

  // Check max entries
  if (comp.max_entries) {
    const { count } = await supabase
      .from("competition_entries")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", competition_id);
    if (count >= comp.max_entries) return;
  }

  await supabase
    .from("competition_entries")
    .upsert({
      competition_id,
      profile_id: user.id,
      score,
      bow_type,
      notes,
      updated_at: new Date().toISOString(),
    }, { onConflict: "competition_id,profile_id" });

  revalidatePath(`/competitions/${competition_id}`);
}

export async function withdrawEntry(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const competition_id = formData.get("competition_id")?.toString();

  await supabase
    .from("competition_entries")
    .delete()
    .eq("competition_id", competition_id)
    .eq("profile_id", user.id);

  revalidatePath(`/competitions/${competition_id}`);
}

export async function awardTrophies(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const competition_id = formData.get("competition_id")?.toString();

  // Verify caller is host or platform_admin
  const { data: comp } = await supabase
    .from("competitions")
    .select("host_id, has_prizes, trophies_awarded, end_date")
    .eq("id", competition_id)
    .single();

  if (!comp || comp.trophies_awarded || !comp.has_prizes) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("platform_admin")
    .eq("id", user.id)
    .single();

  if (comp.host_id !== user.id && !profile?.platform_admin) return;

  const today = new Date().toISOString().slice(0, 10);
  if (today <= comp.end_date) return; // Competition must have ended

  // Get top 3 unique scorers
  const { data: entries } = await supabase
    .from("competition_entries")
    .select("profile_id, score, entered_at")
    .eq("competition_id", competition_id)
    .order("score", { ascending: false })
    .order("entered_at", { ascending: true }); // tie-break: earlier entry wins

  const seen = new Set();
  const top3 = [];
  for (const e of entries ?? []) {
    if (!seen.has(e.profile_id)) {
      seen.add(e.profile_id);
      top3.push(e);
      if (top3.length === 3) break;
    }
  }

  if (!top3.length) return;

  // Insert trophies
  const trophyRows = top3.map((e, i) => ({
    competition_id,
    profile_id: e.profile_id,
    position: i + 1,
  }));

  await supabase.from("trophies").insert(trophyRows);
  await supabase
    .from("competitions")
    .update({ trophies_awarded: true, status: "completed" })
    .eq("id", competition_id);

  revalidatePath(`/competitions/${competition_id}`);
}
