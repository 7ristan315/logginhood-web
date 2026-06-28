"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateCode(brand, product) {
  const prefix = brand.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  const prodPart = (product || "CODE").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${prodPart}-${rand}`;
}

export async function generateCodes(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("insights_members")
    .select("tier")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership || !["admin", "enterprise"].includes(membership.tier)) {
    return { error: "Not authorised to generate codes." };
  }

  const brand = formData.get("brand")?.toString().trim();
  const product = formData.get("product")?.toString().trim() || null;
  const category = formData.get("category")?.toString() || null;
  const bowType = formData.get("bow_type")?.toString() || null;
  const batchName = formData.get("batch_name")?.toString().trim() || null;
  const count = Math.min(5000, Math.max(1, parseInt(formData.get("count")) || 10));
  const months = Math.min(24, Math.max(1, parseInt(formData.get("months")) || 12));

  if (!brand || brand.length < 2) return { error: "Brand name is required." };

  const codes = [];
  const usedCodes = new Set();
  for (let i = 0; i < count; i++) {
    let code;
    do { code = generateCode(brand, product); } while (usedCodes.has(code));
    usedCodes.add(code);
    codes.push({
      code,
      brand,
      product_name: product,
      product_category: category,
      bow_type: bowType,
      batch_name: batchName,
      premium_months: months,
      is_active: true,
    });
  }

  for (let i = 0; i < codes.length; i += 200) {
    const batch = codes.slice(i, i + 200);
    const { error } = await supabase.from("activation_codes").insert(batch);
    if (error) return { error: `Failed to create codes: ${error.message}` };
  }

  revalidatePath("/insights/codes");
  return { success: true, count: codes.length, sample: codes.slice(0, 5).map(c => c.code) };
}
