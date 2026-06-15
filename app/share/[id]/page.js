import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { maxScore, normPct } from "@/lib/rounds";
import ShareComposer from "./ShareComposer";

export default async function SharePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: s } = await supabase
    .from("scores")
    .select("id, round_name, score, golds, shot_at, status, bow_type, age_category, classification")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!s) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("social_links")
    .eq("id", user.id)
    .single();

  const { data: prior } = await supabase
    .from("scores")
    .select("score")
    .eq("profile_id", user.id)
    .eq("round_name", s.round_name)
    .lt("shot_at", s.shot_at)
    .order("score", { ascending: false })
    .limit(1);

  const priorBest = prior?.[0]?.score ?? null;
  const pbDiff = priorBest != null ? s.score - priorBest : null;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-6 md:p-8">
      <Link href={`/history/${s.id}`} className="text-sm hover:text-accent">&larr; Back to round</Link>
      <h1 className="text-2xl font-semibold">Post my score</h1>
      <ShareComposer
        score={s}
        max={maxScore(s.round_name)}
        pct={normPct(s.score, s.round_name)}
        pbDiff={pbDiff}
        socialLinks={profile?.social_links ?? {}}
      />
    </main>
  );
}
