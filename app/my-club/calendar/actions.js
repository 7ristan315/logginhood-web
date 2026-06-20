"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getOfficerMembership(supabase, clubId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("club_members")
    .select("role")
    .eq("club_id", clubId)
    .eq("profile_id", user.id)
    .single();
  return { user, role: data?.role };
}

const OFFICER_ROLES = ["chairman","secretary","records_keeper","tournament_org"];

// ── Sessions ─────────────────────────────────────────────────────────────────

export async function createSession(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const club_id                 = formData.get("club_id")?.toString();
  const name                    = formData.get("name")?.toString().trim().slice(0, 100);
  const location                = formData.get("location")?.toString().trim().slice(0, 100);
  const event_type              = formData.get("event_type")?.toString() || "practice";
  const description             = formData.get("description")?.toString().trim().slice(0, 300) || null;
  const session_date            = formData.get("session_date")?.toString();
  const start_time              = formData.get("start_time")?.toString();
  const end_time                = formData.get("end_time")?.toString();
  const max_places              = parseInt(formData.get("max_places") ?? "20") || 20;
  const is_recurring            = formData.get("is_recurring") === "1";
  const assigned_keyholder_id   = formData.get("assigned_keyholder_id")?.toString() || null;

  if (!club_id || !name || !location || !session_date || !start_time || !end_time) return;

  const { role } = await getOfficerMembership(supabase, club_id);
  if (!OFFICER_ROLES.includes(role)) return;

  let template_id = null;
  if (is_recurring) {
    const dayOfWeek = new Date(session_date + "T00:00:00").getDay();
    const { data: tmpl } = await supabase
      .from("session_templates")
      .insert({ club_id, name, location, description, day_of_week: dayOfWeek, start_time, end_time, max_places, created_by: user.id })
      .select("id")
      .single();
    template_id = tmpl?.id ?? null;
  }

  const firstSession = { template_id, club_id, name, location, description, session_date, start_time, end_time, max_places, assigned_keyholder_id, created_by: user.id };
  const { data: session } = await supabase.from("sessions").insert(firstSession).select("id").single();

  if (is_recurring && template_id && session) {
    const instances = [];
    for (let w = 1; w <= 7; w++) {
      const d = new Date(session_date + "T00:00:00");
      d.setDate(d.getDate() + w * 7);
      instances.push({ ...firstSession, session_date: d.toISOString().slice(0, 10), assigned_keyholder_id: null });
    }
    await supabase.from("sessions").insert(instances);
  }

  revalidatePath("/my-club");
}

export async function cancelSession(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const session_id = formData.get("session_id")?.toString();
  const { data: sess } = await supabase.from("sessions").select("club_id").eq("id", session_id).single();
  if (!sess) return;

  const { role } = await getOfficerMembership(supabase, sess.club_id);
  if (!OFFICER_ROLES.includes(role)) return;

  await supabase.from("sessions").update({ is_cancelled: true }).eq("id", session_id);
  revalidatePath("/my-club");
}

export async function assignSessionKeyholder(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const session_id             = formData.get("session_id")?.toString();
  const assigned_keyholder_id  = formData.get("keyholder_id")?.toString() || null;

  const { data: sess } = await supabase.from("sessions").select("club_id").eq("id", session_id).single();
  if (!sess) return;

  const { role } = await getOfficerMembership(supabase, sess.club_id);
  if (!OFFICER_ROLES.includes(role)) return;

  await supabase.from("sessions").update({ assigned_keyholder_id }).eq("id", session_id);
  revalidatePath("/my-club");
}

export async function bookSession(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const session_id = formData.get("session_id")?.toString();
  const { data: sess } = await supabase.from("sessions").select("max_places, is_cancelled").eq("id", session_id).single();
  if (!sess || sess.is_cancelled) return;

  const { count } = await supabase.from("session_bookings").select("id", { count: "exact", head: true }).eq("session_id", session_id);
  if (count >= sess.max_places) return;

  await supabase.from("session_bookings").upsert({ session_id, profile_id: user.id }, { onConflict: "session_id,profile_id" });
  revalidatePath("/my-club");
}

export async function cancelBooking(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("session_bookings").delete().eq("session_id", formData.get("session_id")).eq("profile_id", user.id);
  revalidatePath("/my-club");
}

// ── Locations ─────────────────────────────────────────────────────────────────

export async function createLocation(formData) {
  const supabase = await createClient();
  const club_id     = formData.get("club_id")?.toString();
  const name        = formData.get("name")?.toString().trim().slice(0, 100);
  const address     = formData.get("address")?.toString().trim() || null;
  const access_notes = formData.get("access_notes")?.toString().trim() || null;

  if (!club_id || !name) return;
  const { role } = await getOfficerMembership(supabase, club_id);
  if (!["chairman","secretary","records_keeper"].includes(role)) return;

  await supabase.from("club_locations").upsert({ club_id, name, address, access_notes }, { onConflict: "club_id,name" });
  revalidatePath("/my-club");
}

export async function updateLocation(formData) {
  const supabase = await createClient();
  const location_id  = formData.get("location_id")?.toString();
  const name         = formData.get("name")?.toString().trim().slice(0, 100);
  const address      = formData.get("address")?.toString().trim() || null;
  const access_notes = formData.get("access_notes")?.toString().trim() || null;

  if (!location_id || !name) return;

  const { data: loc } = await supabase.from("club_locations").select("club_id").eq("id", location_id).single();
  if (!loc) return;
  const { role } = await getOfficerMembership(supabase, loc.club_id);
  if (!["chairman","secretary","records_keeper"].includes(role)) return;

  await supabase.from("club_locations").update({ name, address, access_notes }).eq("id", location_id);
  revalidatePath("/my-club");
}

export async function deleteLocation(formData) {
  const supabase = await createClient();
  const location_id = formData.get("location_id")?.toString();

  const { data: loc } = await supabase.from("club_locations").select("club_id").eq("id", location_id).single();
  if (!loc) return;
  const { role } = await getOfficerMembership(supabase, loc.club_id);
  if (!["chairman","secretary"].includes(role)) return;

  await supabase.from("club_locations").delete().eq("id", location_id);
  revalidatePath("/my-club");
}

// ── Keyholders ────────────────────────────────────────────────────────────────

export async function addKeyholder(formData) {
  const supabase = await createClient();
  const club_id    = formData.get("club_id")?.toString();
  const profile_id = formData.get("profile_id")?.toString();
  const location   = formData.get("location")?.toString();

  if (!club_id || !profile_id || !location) return;
  const { role } = await getOfficerMembership(supabase, club_id);
  if (!["chairman","secretary"].includes(role)) return;

  await supabase.from("keyholders").upsert({ club_id, profile_id, location, is_active: true }, { onConflict: "club_id,profile_id,location" });
  revalidatePath("/my-club");
}

export async function removeKeyholder(formData) {
  const supabase = await createClient();
  const keyholder_id = formData.get("keyholder_id")?.toString();

  const { data: kh } = await supabase.from("keyholders").select("club_id").eq("id", keyholder_id).single();
  if (!kh) return;
  const { role } = await getOfficerMembership(supabase, kh.club_id);
  if (!["chairman","secretary"].includes(role)) return;

  await supabase.from("keyholders").delete().eq("id", keyholder_id);
  revalidatePath("/my-club");
}
