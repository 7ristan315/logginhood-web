"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseDate(str) {
  if (!str) return null;
  str = str.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  // DD/MM/YYYY or DD-MM-YYYY (UK format — most common for archery apps)
  const dmy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,"0")}-${dmy[1].padStart(2,"0")}`;
  // MM/DD/YYYY
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (mdy) {
    const y = mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3];
    return `${y}-${mdy[1].padStart(2,"0")}-${mdy[2].padStart(2,"0")}`;
  }
  const d = new Date(str);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return null;
}

const BOW_MAP = {
  recurve:"Recurve", rec:"Recurve", r:"Recurve",
  compound:"Compound", comp:"Compound", c:"Compound",
  barebow:"Barebow", bb:"Barebow", b:"Barebow",
  longbow:"Longbow", lb:"Longbow", traditional:"Longbow",
};
function normaliseBow(s) {
  if (!s) return null;
  return BOW_MAP[s.toLowerCase().trim()] ?? s;
}

// rows: [{profile_id, round_name, score, golds, shot_at, bow_type, age_category, classification}]
export async function importRows(rows) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify permissions — user can only import for themselves unless they're an officer
  const uniqueProfiles = [...new Set(rows.map(r => r.profile_id))];
  const isSelfOnly = uniqueProfiles.length === 1 && uniqueProfiles[0] === user.id;

  if (!isSelfOnly) {
    const { data: membership } = await supabase
      .from("club_members")
      .select("role, club_id")
      .eq("profile_id", user.id)
      .single();
    if (!membership || !["chairman","records_keeper"].includes(membership.role)) {
      return { error: "Not authorised to import for other members" };
    }
    // Verify all target profiles are in the same club
    const { data: targets } = await supabase
      .from("club_members")
      .select("profile_id")
      .eq("club_id", membership.club_id)
      .in("profile_id", uniqueProfiles);
    const validIds = new Set((targets || []).map(t => t.profile_id));
    if (!uniqueProfiles.every(id => validIds.has(id))) {
      return { error: "One or more archers are not in your club" };
    }
  }

  // Validate and normalise
  const valid = [];
  const errors = [];
  for (const row of rows) {
    const shot_at = parseDate(row.shot_at);
    const score = parseInt(row.score);
    if (!shot_at) { errors.push(`Bad date: "${row.shot_at}"`); continue; }
    if (isNaN(score)) { errors.push(`Bad score: "${row.score}"`); continue; }
    if (!row.round_name?.trim()) { errors.push("Missing round name"); continue; }
    valid.push({
      profile_id: row.profile_id,
      user_id: row.profile_id,
      round_name: row.round_name.trim(),
      score,
      golds: row.golds ? (parseInt(row.golds) || null) : null,
      shot_at,
      bow_type: normaliseBow(row.bow_type),
      age_category: row.age_category?.trim() || null,
      classification: row.classification?.trim() || null,
      status: "submitted",
    });
  }

  if (!valid.length) return { imported: 0, skipped: 0, errors };

  // Duplicate check: skip rows already in the DB
  const { data: existing } = await supabase
    .from("scores")
    .select("profile_id, round_name, shot_at, score")
    .in("profile_id", uniqueProfiles);

  const existingSet = new Set(
    (existing || []).map(s => `${s.profile_id}|${s.round_name}|${s.shot_at}|${s.score}`)
  );
  const toInsert = valid.filter(
    r => !existingSet.has(`${r.profile_id}|${r.round_name}|${r.shot_at}|${r.score}`)
  );
  const skipped = valid.length - toInsert.length;

  let imported = 0;
  for (let i = 0; i < toInsert.length; i += 100) {
    const { error } = await supabase.from("scores").insert(toInsert.slice(i, i + 100));
    if (!error) imported += Math.min(100, toInsert.length - i);
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { imported, skipped, errors };
}
