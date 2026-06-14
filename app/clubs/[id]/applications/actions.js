"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/permissions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://logginhood.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://logginhood.vercel.app";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "Logginhood <invites@logginhood.com>";

export async function approveApplication(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const clubId = formData.get("clubId");
  const profileId = formData.get("profileId");
  if (!clubId || !profileId) return;

  await supabase
    .from("club_members")
    .update({ status: "approved" })
    .eq("club_id", clubId)
    .eq("profile_id", profileId);

  revalidatePath(`/clubs/${clubId}/applications`);
  revalidatePath(`/clubs/${clubId}/members`);
  revalidatePath(`/clubs/${clubId}`);
}

export async function sendInvite(prevState, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const clubId = formData.get("clubId");
  const email = formData.get("email")?.toString().trim();
  if (!clubId || !email) return { error: "Missing club or email." };

  const { data: members } = await supabase
    .from("club_members")
    .select("role")
    .eq("club_id", clubId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!can(members?.role, "manageMembers")) return { error: "You don't have permission to invite members." };

  const { data: club } = await supabase.from("clubs").select("name").eq("id", clubId).single();
  if (!club) return { error: "Club not found." };

  if (!process.env.RESEND_API_KEY) return { error: "Email invites aren't configured yet (missing RESEND_API_KEY)." };

  const inviteLink = `${SITE_URL}/signup?club=${clubId}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: email,
      subject: `You're invited to join ${club.name} on Logginhood`,
      html: `
        <p>You've been invited to join <strong>${club.name}</strong> on Logginhood.</p>
        <p><a href="${inviteLink}">Create your account</a> to get started on the web.</p>
        <p>You can also log your scores on the go with the Logginhood scoring app: <a href="${APP_URL}">${APP_URL}</a> (use the same email/password once you've signed up).</p>
        <p>Once you sign up, the club's chairman will be able to approve your membership.</p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { error: `Failed to send invite: ${body}` };
  }

  return { success: `Invite sent to ${email}.` };
}

export async function rejectApplication(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const clubId = formData.get("clubId");
  const profileId = formData.get("profileId");
  if (!clubId || !profileId) return;

  await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("profile_id", profileId);

  revalidatePath(`/clubs/${clubId}/applications`);
  revalidatePath(`/clubs/${clubId}/members`);
  revalidatePath(`/clubs/${clubId}`);
}
