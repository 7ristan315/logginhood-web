import { createClient } from "@/lib/supabase/server";
import { readdirSync } from "fs";
import { join } from "path";
import LogoGallery from "./LogoGallery";

export const metadata = {
  title: "Logo Vote · Logginhood",
  description: "Vote for your favourite Logginhood logo concept",
};

export default async function LogosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const logosDir = join(process.cwd(), "public", "logos");
  let files = [];
  try {
    files = readdirSync(logosDir).filter(f => /\.(png|jpg|jpeg|svg|webp)$/i.test(f)).sort();
  } catch {}

  const { data: votes } = await supabase
    .from("logo_votes")
    .select("logo_filename");

  const voteCounts = {};
  for (const v of votes || []) {
    voteCounts[v.logo_filename] = (voteCounts[v.logo_filename] || 0) + 1;
  }

  let userVotes = new Set();
  if (user) {
    const { data: myVotes } = await supabase
      .from("logo_votes")
      .select("logo_filename")
      .eq("profile_id", user.id);
    userVotes = new Set((myVotes || []).map(v => v.logo_filename));
  }

  const totalVotes = Object.values(voteCounts).reduce((s, n) => s + n, 0);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Logo vote</h1>
        <p className="mt-1 text-sm opacity-60">
          Help us choose the new Logginhood logo — click to zoom, vote for your favourites.
          {totalVotes > 0 && <span className="ml-2 font-semibold" style={{ color: "var(--accent)" }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast so far</span>}
        </p>
      </div>

      <LogoGallery
        logos={files}
        voteCounts={voteCounts}
        userVotes={userVotes}
        isLoggedIn={!!user}
      />
    </main>
  );
}
