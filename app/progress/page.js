import { createClient } from "@/lib/supabase/server";
import ProgressCharts from "@/components/ProgressCharts";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: scores } = await supabase
    .from("scores")
    .select("id, round_name, score, golds, shot_at, ends")
    .eq("profile_id", user.id)
    .order("shot_at", { ascending: true });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-8">
      <h1 className="text-2xl font-semibold">Progress</h1>
      <ProgressCharts scores={scores ?? []} />
    </main>
  );
}
