import { createClient } from "@/lib/supabase/server";
import { addScore } from "./actions";
import ScoreForm from "./ScoreForm";

export default async function NewScorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("club_members")
    .select("clubs(id, name)")
    .eq("profile_id", user.id);

  const clubs = (memberships ?? []).map((m) => m.clubs).filter(Boolean);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Add a score</h1>
      <ScoreForm clubs={clubs} action={addScore} />
    </main>
  );
}
