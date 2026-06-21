"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveSetup(setup) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const row = {
    profile_id: user.id,
    name: setup.name,
    bow_type: setup.bow_type,
    is_active: setup.is_active ?? false,
    riser: setup.riser || null,
    limbs: setup.limbs || null,
    draw_weight: setup.draw_weight || null,
    draw_length: setup.draw_length || null,
    sight: setup.sight || null,
    button: setup.button || null,
    clicker: setup.clicker || null,
    tab: setup.tab || null,
    sling: setup.sling || null,
    release_aid: setup.release_aid || null,
    scope: setup.scope || null,
    stabilisers: setup.stabilisers || null,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (setup.id) {
    result = await supabase.from("bow_setups").update(row).eq("id", setup.id).eq("profile_id", user.id).select().single();
  } else {
    result = await supabase.from("bow_setups").insert(row).select().single();
  }

  if (result.error) return { error: result.error.message };

  // If marking active, deactivate others of same bow_type
  if (setup.is_active) {
    await supabase.from("bow_setups")
      .update({ is_active: false })
      .eq("profile_id", user.id)
      .eq("bow_type", setup.bow_type)
      .neq("id", result.data.id);
  }

  revalidatePath("/my-setup");
  return { data: result.data };
}

export async function deleteSetup(id) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { error } = await supabase.from("bow_setups").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/my-setup");
  return { ok: true };
}

export async function saveSightMarks(setupId, marks) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  // Verify ownership
  const { data: setup } = await supabase.from("bow_setups").select("id").eq("id", setupId).eq("profile_id", user.id).single();
  if (!setup) return { error: "Setup not found" };

  // Delete existing and re-insert
  await supabase.from("sight_marks").delete().eq("setup_id", setupId);
  if (marks.length > 0) {
    const rows = marks.filter(m => m.distance).map(m => ({
      setup_id: setupId,
      distance: m.distance,
      sight_number: m.sight_number ?? null,
      extension_bar: m.extension_bar ?? null,
      notes: m.notes || null,
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from("sight_marks").insert(rows);
      if (error) return { error: error.message };
    }
  }

  revalidatePath("/my-setup");
  return { ok: true };
}

export async function saveCrawlMarks(setupId, marks) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: setup } = await supabase.from("bow_setups").select("id").eq("id", setupId).eq("profile_id", user.id).single();
  if (!setup) return { error: "Setup not found" };

  await supabase.from("crawl_marks").delete().eq("setup_id", setupId);
  if (marks.length > 0) {
    const rows = marks.filter(m => m.distance).map(m => ({
      setup_id: setupId,
      distance: m.distance,
      finger_position: m.finger_position || null,
      anchor: m.anchor || null,
      tab_count: m.tab_count ?? null,
      notes: m.notes || null,
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from("crawl_marks").insert(rows);
      if (error) return { error: error.message };
    }
  }

  revalidatePath("/my-setup");
  return { ok: true };
}

export async function saveArrowSet(setupId, arrow) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const row = {
    setup_id: setupId,
    name: arrow.name,
    spine: arrow.spine || null,
    length: arrow.length || null,
    point_weight: arrow.point_weight || null,
    fletching: arrow.fletching || null,
    nock: arrow.nock || null,
    clicker_offset: arrow.clicker_offset ?? null,
    is_active: arrow.is_active ?? false,
    notes: arrow.notes || null,
  };

  let result;
  if (arrow.id) {
    result = await supabase.from("setup_arrows").update(row).eq("id", arrow.id).select().single();
  } else {
    result = await supabase.from("setup_arrows").insert(row).select().single();
  }

  if (result.error) return { error: result.error.message };

  if (arrow.is_active) {
    await supabase.from("setup_arrows")
      .update({ is_active: false })
      .eq("setup_id", setupId)
      .neq("id", result.data.id);
  }

  revalidatePath("/my-setup");
  return { data: result.data };
}

export async function deleteArrowSet(id) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { error } = await supabase.from("setup_arrows").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/my-setup");
  return { ok: true };
}
