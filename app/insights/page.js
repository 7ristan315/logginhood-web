import { createClient } from "@/lib/supabase/server";
import InsightsShell from "./InsightsShell";

export const metadata = {
  title: "Logginhood Insights",
  description: "Equipment performance analytics for the archery industry",
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
      />
    </main>
  );
}
