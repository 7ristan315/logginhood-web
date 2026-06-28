"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function redeemCode(formData) {
  const code = formData.get("code")?.toString().trim().toUpperCase();
  if (!code || code.length < 4) return { error: "Please enter a valid code." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to redeem a code." };

  const { data: existing } = await supabase
    .from("premium_subscriptions")
    .select("id, expires_at, source")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const { data: codeRow, error: fetchErr } = await supabase
    .from("activation_codes")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .is("redeemed_by", null)
    .maybeSingle();

  if (fetchErr || !codeRow) return { error: "Invalid or already redeemed code." };

  if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
    return { error: "This code has expired." };
  }

  const { error: redeemErr } = await supabase
    .from("activation_codes")
    .update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() })
    .eq("id", codeRow.id)
    .is("redeemed_by", null);

  if (redeemErr) return { error: "Failed to redeem code. It may have already been used." };

  const months = codeRow.premium_months || 12;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);

  if (existing) {
    const existingExpiry = new Date(existing.expires_at);
    if (existingExpiry > new Date()) {
      expiresAt.setMonth(expiresAt.getMonth() + Math.ceil((existingExpiry - new Date()) / (30 * 24 * 60 * 60 * 1000)));
    }
    await supabase.from("premium_subscriptions").update({ is_active: false }).eq("id", existing.id);
  }

  await supabase.from("premium_subscriptions").insert({
    profile_id: user.id,
    source: "activation_code",
    activation_code_id: codeRow.id,
    starts_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true,
  });

  if (codeRow.product_name && codeRow.product_category) {
    const field = { riser: "riser", limbs: "limbs" }[codeRow.product_category];
    if (field) {
      const { data: activeSetup } = await supabase
        .from("bow_setups")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_active", true)
        .eq("bow_type", codeRow.bow_type || "Recurve")
        .maybeSingle();

      if (activeSetup) {
        await supabase.from("bow_setups").update({ [field]: `${codeRow.brand} ${codeRow.product_name}` }).eq("id", activeSetup.id);
      }
    }
  }

  revalidatePath("/activate");
  return {
    success: true,
    brand: codeRow.brand,
    product: codeRow.product_name,
    months,
  };
}
