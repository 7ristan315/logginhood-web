import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { can } from "@/lib/permissions";
import { approveApplication, rejectApplication } from "./actions";
import InviteForm from "./invite-form";

export default async function ClubApplicationsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: club } = await supabase.from("clubs").select("id, name").eq("id", id).single();
  if (!club) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, role, status")
    .eq("club_id", id);

  const myRole = members?.find((m) => m.profile_id === user.id)?.role;
  if (!can(myRole, "manageMembers")) redirect(`/clubs/${id}`);

  const pendingIds = (members ?? [])
    .filter((m) => m.status === "pending")
    .map((m) => m.profile_id);

  let applicants = [];
  if (pendingIds.length) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", pendingIds);
    applicants = data ?? [];
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 md:p-8">
      <PageHeader
        title={`${club.name} — Applications`}
        actions={
          <Link href={`/clubs/${club.id}/members`} className="text-sm hover:text-accent">
            &larr; Back to members
          </Link>
        }
      />

      <Card title="Invite members">
        <InviteForm clubId={club.id} inviteLink={`${process.env.NEXT_PUBLIC_SITE_URL || "https://logginhood.com"}/signup?club=${club.id}`} />
      </Card>

      <Card title="Applications">
        {!applicants.length ? (
          <EmptyState icon="📋" title="No pending applications" />
        ) : (
          <ul className="flex flex-col gap-3">
            {applicants.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 border-b border-accent-light pb-3 last:border-none last:pb-0">
                <div>
                  <p>{a.full_name ?? "Unnamed archer"}</p>
                  {a.email && <p className="text-xs opacity-60">{a.email}</p>}
                </div>
                <div className="flex gap-2">
                  <form action={approveApplication}>
                    <input type="hidden" name="clubId" value={club.id} />
                    <input type="hidden" name="profileId" value={a.id} />
                    <button type="submit" className="btn-primary text-sm">
                      Approve
                    </button>
                  </form>
                  <form action={rejectApplication}>
                    <input type="hidden" name="clubId" value={club.id} />
                    <input type="hidden" name="profileId" value={a.id} />
                    <button type="submit" className="btn-secondary text-sm">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
