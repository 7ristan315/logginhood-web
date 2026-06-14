import { createClient } from "@/lib/supabase/server";
import ThemeSettings from "@/components/ThemeSettings";
import { updateClubUrl } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("club_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <ThemeSettings />

      <div className="card flex flex-col gap-2">
        <p className="text-sm font-medium">Club website</p>
        <p className="text-xs opacity-70">
          Visit your club&apos;s site to find their brand colours.
        </p>
        <form action={updateClubUrl} className="flex gap-2">
          <input
            name="club_url"
            type="url"
            defaultValue={profile?.club_url ?? ""}
            placeholder="https://yourclub.co.uk"
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">Save</button>
        </form>
        {profile?.club_url && (
          <a href={profile.club_url} target="_blank" rel="noreferrer" className="text-sm hover:text-accent">
            Visit ↗
          </a>
        )}
      </div>
    </main>
  );
}
