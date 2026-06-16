"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCompetition(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name")?.toString().trim().slice(0, 100);
  const description = formData.get("description")?.toString().trim().slice(0, 500) || null;
  const round_name = formData.get("round_name")?.toString();
  const bow_type = formData.get("bow_type")?.toString() || null;
  const start_date = formData.get("start_date")?.toString();
  const end_date = formData.get("end_date")?.toString();
  const max_entries = formData.get("max_entries") ? parseInt(formData.get("max_entries")) : null;
  const club_id = formData.get("club_id")?.toString() || null;
  const has_prizes = formData.get("has_prizes") === "1";

  if (!name || !round_name || !start_date || !end_date) redirect("/competitions/new");
  if (end_date < start_date) redirect("/competitions/new");

  const today = new Date().toISOString().slice(0, 10);
  const status = start_date <= today ? "active" : "upcoming";

  const { data, error } = await supabase
    .from("competitions")
    .insert({
      name,
      description,
      host_id: user.id,
      club_id,
      round_name,
      bow_type,
      start_date,
      end_date,
      max_entries,
      has_prizes,
      status,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/competitions");

  redirect(`/competitions/${data.id}`);
}
