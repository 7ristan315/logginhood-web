import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetupManager from "./SetupManager";

export default async function MySetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: setups } = await supabase
    .from("bow_setups")
    .select("*")
    .eq("profile_id", user.id)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch related data for each setup
  const setupIds = (setups || []).map(s => s.id);

  const { data: sightMarks } = setupIds.length > 0
    ? await supabase.from("sight_marks").select("*").in("setup_id", setupIds).order("distance")
    : { data: [] };

  const { data: crawlMarks } = setupIds.length > 0
    ? await supabase.from("crawl_marks").select("*").in("setup_id", setupIds).order("distance")
    : { data: [] };

  const { data: arrowSets } = setupIds.length > 0
    ? await supabase.from("setup_arrows").select("*").in("setup_id", setupIds).order("is_active", { ascending: false })
    : { data: [] };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">My Setup</h1>
        <p className="text-sm opacity-50 mt-1">Your bows, arrows, sights, and equipment — all in one place.</p>
      </div>
      <SetupManager
        setups={setups || []}
        sightMarks={sightMarks || []}
        crawlMarks={crawlMarks || []}
        arrowSets={arrowSets || []}
      />
    </main>
  );
}
