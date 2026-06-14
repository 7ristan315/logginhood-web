import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { reviewClub } from "./actions";
import DeleteClubButton from "./delete-button";

export default async function AdminClubsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("platform_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.platform_admin) redirect("/");

  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, location, affiliation_number, official_email, status, governing_bodies(name), profiles!clubs_created_by_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  const emailDomain = (email) => email?.split("@")[1]?.toLowerCase();

  const pending = clubs?.filter((c) => c.status === "pending") ?? [];
  const reviewed = clubs?.filter((c) => c.status !== "pending") ?? [];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 md:p-8">
      <PageHeader title="Club verification" subtitle="Review newly proposed clubs" />

      <Card title={`Pending (${pending.length})`}>
        {!pending.length ? (
          <EmptyState icon="✅" title="Nothing to review" description="All proposed clubs have been reviewed." />
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((club) => {
              const proposerDomain = emailDomain(club.profiles?.email);
              const officialDomain = emailDomain(club.official_email);
              const domainMatch = officialDomain && proposerDomain === officialDomain;
              return (
              <li key={club.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-accent-light pb-3 last:border-none last:pb-0">
                <div>
                  <Link href={`/clubs/${club.id}`} className="font-medium hover:text-accent">
                    {club.name}
                  </Link>
                  {club.location && <p className="text-sm opacity-70">{club.location}</p>}
                  <p className="text-xs opacity-60">
                    {club.governing_bodies?.name ?? "No governing body given"}
                    {club.affiliation_number && ` · Affiliation #${club.affiliation_number}`}
                    {" · proposed by "}
                    {club.profiles?.full_name ?? "Unknown"}
                    {club.profiles?.email && ` (${club.profiles.email})`}
                  </p>
                  <p className="text-xs opacity-60">
                    {club.official_email ? (
                      <>
                        Official email: {club.official_email}{" "}
                        {domainMatch ? (
                          <Badge variant="success">✅ Domain matches</Badge>
                        ) : (
                          <Badge variant="warning">Domain mismatch</Badge>
                        )}
                      </>
                    ) : (
                      "No official email given"
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={reviewClub}>
                    <input type="hidden" name="clubId" value={club.id} />
                    <input type="hidden" name="decision" value="verified" />
                    <button type="submit" className="btn-primary text-sm">
                      Verify
                    </button>
                  </form>
                  <form action={reviewClub}>
                    <input type="hidden" name="clubId" value={club.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button type="submit" className="btn-secondary text-sm">
                      Reject
                    </button>
                  </form>
                  <DeleteClubButton clubId={club.id} clubName={club.name} />
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title={`Reviewed (${reviewed.length})`}>
        {!reviewed.length ? (
          <p className="text-sm opacity-60">No reviewed clubs yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reviewed.map((club) => (
              <li key={club.id} className="flex items-center justify-between gap-3 text-sm">
                <Link href={`/clubs/${club.id}`} className="hover:text-accent">
                  {club.name}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant={club.status === "verified" ? "success" : "danger"}>
                    {club.status === "verified" ? "✅ Verified" : "Rejected"}
                  </Badge>
                  <Link href={`/clubs/${club.id}/members`} className="text-sm hover:text-accent">
                    Members
                  </Link>
                  <DeleteClubButton clubId={club.id} clubName={club.name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
