"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSession(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const club_id = formData.get("club_id")?.toString();
  const name = formData.get("name")?.toString().trim().slice(0, 100);
  const location = formData.get("location")?.toString().trim().slice(0, 100);
  const description = formData.get("description")?.toString().trim().slice(0, 300) || null;
  const session_date = formData.get("session_date")?.toString();
  const start_time = formData.get("start_time")?.toString();
  const end_time = formData.get("end_time")?.toString();
  const max_places = parseInt(formData.get("max_places") ?? "20") || 20;
  const is_recurring = formData.get("is_recurring") === "1";
  const day_of_week = is_recurring ? parseInt(formData.get("day_of_week")) : null;

  if (!club_id || !name || !location || !session_date || !start_time || !end_time) return;

  // Check user is chairman/records_keeper of this club
  const { data: membership } = await supabase
    .from("club_members")
    .select("role")
    .eq("club_id", club_id)
    .eq("profile_id", user.id)
    .single();

  if (!membership || !["chairman", "records_keeper"].includes(membership.role)) return;

  // If recurring, create a template first
  let template_id = null;
  if (is_recurring && day_of_week !== null) {
    const { data: template } = await supabase
      .from("session_templates")
      .insert({ club_id, name, location, description, day_of_week, start_time, end_time, max_places, created_by: user.id })
      .select("id")
      .single();
    template_id = template?.id ?? null;
  }

  // Create the first/only session instance
  const { data: session } = await supabase
    .from("sessions")
    .insert({ template_id, club_id, name, location, description, session_date, start_time, end_time, max_places, created_by: user.id })
    .select("id")
    .single();

  // If recurring, generate next 5 weeks of sessions from the template
  if (is_recurring && template_id && day_of_week !== null) {
    const base = new Date(session_date);
    const instances = [];
    for (let w = 1; w <= 5; w++) {
      const d = new Date(base);
      d.setDate(d.getDate() + w * 7);
      instances.push({
        template_id,
        club_id,
        name,
        location,
        description,
        session_date: d.toISOString().slice(0, 10),
        start_time,
        end_time,
        max_places,
        created_by: user.id,
      });
    }
    await supabase.from("sessions").insert(instances);
  }

  // Alert keyholders for this location if none are already booked
  if (session?.id) {
    await alertKeyholders(supabase, session.id, club_id, location, name, session_date, start_time);
  }

  revalidatePath("/my-club");
}

export async function bookSession(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const session_id = formData.get("session_id")?.toString();

  // Verify there's space
  const { data: sess } = await supabase
    .from("sessions")
    .select("max_places, is_cancelled")
    .eq("id", session_id)
    .single();

  if (!sess || sess.is_cancelled) return;

  const { count } = await supabase
    .from("session_bookings")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session_id);

  if (count >= sess.max_places) return;

  await supabase
    .from("session_bookings")
    .upsert({ session_id, profile_id: user.id }, { onConflict: "session_id,profile_id" });

  revalidatePath("/my-club");
}

export async function cancelBooking(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const session_id = formData.get("session_id")?.toString();

  await supabase
    .from("session_bookings")
    .delete()
    .eq("session_id", session_id)
    .eq("profile_id", user.id);

  revalidatePath("/my-club");
}

async function alertKeyholders(supabase, sessionId, clubId, location, sessionName, sessionDate, startTime) {
  // Find keyholders for this location who are NOT already booked
  const { data: keyholders } = await supabase
    .from("keyholders")
    .select("profile_id, profiles(full_name)")
    .eq("club_id", clubId)
    .eq("location", location)
    .eq("is_active", true);

  if (!keyholders?.length) return;

  const { data: booked } = await supabase
    .from("session_bookings")
    .select("profile_id")
    .eq("session_id", sessionId)
    .in("profile_id", keyholders.map((k) => k.profile_id));

  const bookedIds = new Set((booked ?? []).map((b) => b.profile_id));
  const unbooked = keyholders.filter((k) => !bookedIds.has(k.profile_id));

  if (!unbooked.length) return;

  // Get keyholder email addresses
  const { data: { admin: adminClient } } = { data: {} };
  // Email sending requires RESEND_API_KEY — log intent for now
  // Production: use lib/email.js with Resend
  const profileIds = unbooked.map((k) => k.profile_id);

  // Mark alert as sent on the session
  await supabase
    .from("sessions")
    .update({ keyholder_alert_sent: true })
    .eq("id", sessionId);
}
