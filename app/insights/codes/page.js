import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CodesClient from "./CodesClient";

export const metadata = {
  title: "Activation Codes · Logginhood Insights",
  description: "Generate and manage equipment activation codes",
};

export default async function CodesPage() {
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
    redirect("/insights");
  }

  const { data: allCodes } = await supabase
    .from("activation_codes")
    .select("code, brand, product_name, batch_name, redeemed_by, redeemed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  const codes = allCodes || [];
  const total = codes.length;
  const redeemed = codes.filter(c => c.redeemed_by).length;

  const batchMap = {};
  for (const c of codes) {
    const key = c.batch_name || c.brand;
    if (!batchMap[key]) {
      batchMap[key] = { name: c.batch_name, brand: c.brand, product: c.product_name, total: 0, redeemed: 0, created: c.created_at?.slice(0, 10), codes: [] };
    }
    batchMap[key].total++;
    if (c.redeemed_by) batchMap[key].redeemed++;
    batchMap[key].codes.push(c);
  }
  const batches = Object.values(batchMap).sort((a, b) => (b.created || "").localeCompare(a.created || ""));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
      <div>
        <Link href="/insights" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)", textDecoration: "none" }}>
          ← Back to Insights
        </Link>
        <h1 className="text-2xl font-bold mt-1">Activation codes</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Generate codes for equipment packaging. Archers redeem at logginhood.com/activate
        </p>
      </div>
      <CodesClient batches={batches} stats={{ total, redeemed }} />
    </main>
  );
}
