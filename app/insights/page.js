import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InsightsShell from "./InsightsShell";

export const metadata = {
  title: "Logginhood Insights",
  description: "Equipment performance analytics for the archery industry",
};

const TIER_ACCESS = {
  admin:        ["overview", "products", "market", "demographics", "arrows", "journey", "competitive", "methodology"],
  enterprise:   ["overview", "products", "market", "demographics", "arrows", "journey", "competitive", "methodology"],
  professional: ["overview", "products", "market", "demographics", "arrows", "methodology"],
  starter:      ["overview", "market", "methodology"],
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("insights_members")
    .select("tier, company_name, brand_filter, is_active, expires_at")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    return (
      <main className="mx-auto max-w-2xl p-4 md:p-8">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-5xl">🔒</span>
          <h1 className="text-2xl font-bold">Logginhood Insights</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Equipment performance analytics for archery manufacturers and brands.
          </p>
          <div className="card flex flex-col gap-3 text-left max-w-md w-full mt-4">
            <h2 className="font-semibold">What you get</h2>
            <ul className="text-sm flex flex-col gap-2" style={{ color: "var(--text-secondary)" }}>
              <li>Product vs product head-to-head comparison</li>
              <li>Market share and switching/churn analysis</li>
              <li>Archer demographics by equipment</li>
              <li>Arrow performance lab</li>
              <li>Equipment journey tracking</li>
              <li>Competition vs practice insights</li>
            </ul>
            <div className="flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Starter</span>
                <span style={{ color: "var(--accent)" }}>£250/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Professional</span>
                <span style={{ color: "var(--accent)" }}>£750/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Enterprise</span>
                <span style={{ color: "var(--accent)" }}>£2,000/month</span>
              </div>
            </div>
            <a href="mailto:tristan@logginhood.com?subject=Insights%20access%20request" className="btn-primary text-center mt-2">
              Request access
            </a>
          </div>
        </div>
      </main>
    );
  }

  const tier = membership.tier;
  const allowedSections = TIER_ACCESS[tier] || TIER_ACCESS.starter;

  const [
    { data: platformStats },
    { data: equipPerf },
    { data: setupDna },
    { data: arrowPerf },
    { data: marketShare },
    { data: journey },
    { data: switching },
    { data: catalog },
  ] = await Promise.all([
    supabase.from("insights_platform_stats").select("*").single(),
    supabase.from("insights_equipment_performance").select("*").order("sample_size", { ascending: false }).limit(500),
    supabase.from("insights_setup_dna").select("*").order("archer_count", { ascending: false }).limit(200),
    supabase.from("insights_arrow_performance").select("*").order("sample_size", { ascending: false }).limit(200),
    supabase.from("insights_market_share").select("*").order("archer_count", { ascending: false }).limit(500),
    supabase.from("insights_equipment_journey").select("*").order("round_count", { ascending: false }).limit(200),
    supabase.from("insights_switching_events").select("*").limit(500),
    supabase.from("equipment_catalog").select("category, brand, model").order("brand").order("model"),
  ]);

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <InsightsShell
        stats={platformStats}
        equipPerf={equipPerf || []}
        setupDna={setupDna || []}
        arrowPerf={arrowPerf || []}
        marketShare={marketShare || []}
        journey={journey || []}
        switching={switching || []}
        catalog={catalog || []}
        tier={tier}
        allowedSections={allowedSections}
        companyName={membership.company_name}
        brandFilter={membership.brand_filter}
      />
    </main>
  );
}
