import { createClient } from "@/lib/supabase/server";
import InsightsDashboard from "./InsightsDashboard";

export const metadata = {
  title: "Logginhood Insights",
  description: "Equipment performance data for archery manufacturers",
};

export default async function InsightsPage() {
  const supabase = await createClient();

  const [
    { data: platformStats },
    { data: equipPerf },
    { data: setupDna },
    { data: arrowPerf },
    { data: marketShare },
    { data: journey },
  ] = await Promise.all([
    supabase.from("insights_platform_stats").select("*").single(),
    supabase.from("insights_equipment_performance").select("*").order("sample_size", { ascending: false }).limit(50),
    supabase.from("insights_setup_dna").select("*").order("archer_count", { ascending: false }).limit(50),
    supabase.from("insights_arrow_performance").select("*").order("sample_size", { ascending: false }).limit(50),
    supabase.from("insights_market_share").select("*").order("archer_count", { ascending: false }).limit(50),
    supabase.from("insights_equipment_journey").select("*").order("round_count", { ascending: false }).limit(50),
  ]);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <InsightsDashboard
        stats={platformStats}
        equipPerf={equipPerf || []}
        setupDna={setupDna || []}
        arrowPerf={arrowPerf || []}
        marketShare={marketShare || []}
        journey={journey || []}
      />
    </main>
  );
}
