"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import crypto from "crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function confirmConsent({ token, profileId }) {
  if (!token || !profileId) return { error: "This consent link is invalid." };

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, consent_status, consent_token_hash, consent_requested_at, consent_scope")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) return { error: "This consent link is no longer valid." };
  if (profile.consent_status === "granted") {
    return { success: true, already: true, name: profile.full_name };
  }
  if (!profile.consent_token_hash || profile.consent_token_hash !== tokenHash) {
    return { error: "This consent link is invalid or has already been used." };
  }
  const reqAt = profile.consent_requested_at ? new Date(profile.consent_requested_at).getTime() : 0;
  if (reqAt && Date.now() - reqAt > TOKEN_TTL_MS) {
    return { error: "This consent link has expired. Please ask your child to request a new one from the app." };
  }

  // Capture the approving party's IP for the consent audit trail (DPIA evidence).
  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") || "").split(",")[0].trim() || hdrs.get("x-real-ip") || null;

  const { error } = await admin
    .from("profiles")
    .update({
      consent_status: "granted",
      consent_granted_at: new Date().toISOString(),
      consent_ip: ip,
      consent_token_hash: null,
    })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true, name: profile.full_name };
}
