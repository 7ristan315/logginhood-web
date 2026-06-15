import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { can, roleLabel } from "@/lib/permissions";
import { updateMemberRole, removeMember } from "./actions";
import RoleSelect from "./RoleSelect";
import EmailMembersButton from "./EmailMembersButton";

export default async function ClubMembersPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: club } = await supabase.from("clubs").select("id, name").eq("id", id).single();
  if (!club) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("club_members")
    .select("profile_id, role, joined_at, profiles(full_name, email)")
    .eq("club_id", id)
    .eq("status", "approved")
    .order("joined_at");

  let isPlatformAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("platform_admin").eq("id", user.id).single();
    isPlatformAdmin = !!profile?.platform_admin;
  }

  const myRole = members?.find((m) => m.profile_id === user?.id)?.role;
  const canManage = can(myRole, "manageMembers") || isPlatformAdmin;
  const isElevated = (myRole && myRole !== "member") || isPlatformAdmin;
  const memberEmails = (members ?? []).map((m) => m.profiles?.email).filter(Boolean);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 md:p-8">
      <PageHeader
        title={`${club.name} — Members`}
        actions={
          <div className="flex items-center gap-4">
            {isElevated && <EmailMembersButton emails={memberEmails} clubName={club.name} />}
            {canManage && (
              <Link href={`/clubs/${club.id}/applications`} className="text-sm hover:text-accent">
                📋 Applications
              </Link>
            )}
            <Link href={`/clubs/${club.id}`} className="text-sm hover:text-accent">
              &larr; Back to club
            </Link>
          </div>
        }
      />

      <Card>
        {!members?.length ? (
          <EmptyState icon="🧑‍🤝‍🧑" title="No members yet" />
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Role</th>
                <th className="py-2 pr-2">Joined</th>
                {canManage && <th className="py-2 pr-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.profile_id} className="border-b last:border-none">
                  <td className="py-2 pr-2">
                    {m.profiles?.full_name ?? "Unnamed archer"}
                    {m.profile_id === user?.id && <span className="ml-2 text-xs opacity-50">(you)</span>}
                  </td>
                  <td className="py-2 pr-2">
                    {canManage ? (
                      <RoleSelect clubId={club.id} profileId={m.profile_id} role={m.role} action={updateMemberRole} />
                    ) : (
                      <Badge variant={m.role === "chairman" ? "info" : "default"}>{roleLabel(m.role)}</Badge>
                    )}
                  </td>
                  <td className="py-2 pr-2 text-xs opacity-60">{m.joined_at?.slice(0, 10)}</td>
                  {canManage && (
                    <td className="py-2 pr-2 text-right">
                      {m.profile_id !== user?.id && (
                        <form action={removeMember}>
                          <input type="hidden" name="clubId" value={club.id} />
                          <input type="hidden" name="profileId" value={m.profile_id} />
                          <button type="submit" className="text-xs opacity-60 hover:text-red-600 hover:opacity-100">
                            Remove
                          </button>
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </main>
  );
}
