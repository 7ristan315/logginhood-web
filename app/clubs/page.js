import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { createClub, joinClub } from "./actions";

export default async function ClubsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: clubs }, { data: governingBodies }] = await Promise.all([
    supabase
      .from("clubs")
      .select("id, name, location, status, governing_bodies(name)")
      .order("name"),
    supabase.from("governing_bodies").select("id, name").order("name"),
  ]);

  let memberClubIds = new Set();
  if (user) {
    const { data: memberships } = await supabase
      .from("club_members")
      .select("club_id")
      .eq("profile_id", user.id);
    memberClubIds = new Set((memberships ?? []).map((m) => m.club_id));
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Clubs</h1>

      {!clubs?.length ? (
        <p className="text-gray-600">No clubs yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {clubs.map((club) => (
            <li key={club.id} className="flex items-center justify-between rounded-lg border p-3 hover:border-accent transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/clubs/${club.id}`} className="font-medium underline">
                    {club.name}
                  </Link>
                  {club.status === "verified" ? (
                    <Badge variant="success">✅ Verified</Badge>
                  ) : club.status === "pending" ? (
                    <Badge variant="warning">Pending review</Badge>
                  ) : null}
                </div>
                {club.location && (
                  <p className="text-sm text-gray-600">{club.location}</p>
                )}
                {club.governing_bodies?.name && (
                  <p className="text-xs opacity-60">{club.governing_bodies.name}</p>
                )}
              </div>
              {user && !memberClubIds.has(club.id) && (
                <form action={joinClub}>
                  <input type="hidden" name="clubId" value={club.id} />
                  <button type="submit" className="btn-secondary text-xs">
                    Join
                  </button>
                </form>
              )}
              {user && memberClubIds.has(club.id) && (
                <span className="text-sm text-gray-500">Member</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {user && (
        <form action={createClub} className="flex flex-col gap-3 rounded-lg border p-4 bg-accent-light">
          <h2 className="font-medium">Propose a club</h2>
          <p className="text-sm opacity-70">
            New clubs start as <strong>pending</strong> until reviewed by a platform admin. You&rsquo;ll become its
            chairman once approved.
          </p>
          <input
            name="name"
            placeholder="Club name"
            required
            className="input-field"
          />
          <input
            name="location"
            placeholder="Location (optional)"
            className="input-field"
          />
          <select name="governingBodyId" className="input-field" defaultValue="">
            <option value="">Governing body / country (optional)</option>
            {governingBodies?.map((gb) => (
              <option key={gb.id} value={gb.id}>
                {gb.name}
              </option>
            ))}
          </select>
          <input
            name="affiliationNumber"
            placeholder="Affiliation number (optional)"
            className="input-field"
          />
          <button type="submit" className="btn-primary">
            Submit for review
          </button>
        </form>
      )}
    </main>
  );
}
