import { createClient } from "@/lib/supabase/server";
import { SOCIAL_PLATFORMS } from "@/lib/social";
import { TrophyCabinet } from "@/components/ui/Trophy";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, gb_number, gender, date_of_birth, bow_type, age_category, club_id, social_links")
    .eq("id", user.id)
    .single();

  const socialLinks = profile?.social_links ?? {};

  const { data: clubs } = await supabase.from("clubs").select("id, name").order("name");

  const { data: trophies } = await supabase
    .from("trophies")
    .select(`
      id, position, awarded_at, competition_id,
      competitions(name, round_name, end_date, clubs(name))
    `)
    .eq("profile_id", user.id)
    .order("awarded_at", { ascending: false });

  const trophyCount = trophies?.length ?? 0;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8 lg:flex-row lg:items-start lg:gap-8">

      {/* Profile form */}
      <div className="w-full lg:max-w-lg">
        <h1 className="text-2xl font-bold mb-1">Your profile</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Manage your archer details and social links.</p>

        <form action={updateProfile} className="flex flex-col gap-5">

          {/* Personal details */}
          <fieldset className="card flex flex-col gap-4">
            <legend className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Personal details</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Full name
                <input name="full_name" defaultValue={profile?.full_name ?? ""} className="input-field" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Archery GB number
                <input name="gb_number" defaultValue={profile?.gb_number ?? ""} placeholder="GB123456" className="input-field" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Gender
                <select name="gender" defaultValue={profile?.gender ?? ""} className="input-field">
                  <option value="">— Not set —</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Date of birth
                <input type="date" name="date_of_birth" defaultValue={profile?.date_of_birth ?? ""} className="input-field" />
              </label>
            </div>
          </fieldset>

          {/* Archery */}
          <fieldset className="card flex flex-col gap-4">
            <legend className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Archery</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Bow type
                <select name="bow_type" defaultValue={profile?.bow_type ?? ""} className="input-field">
                  <option value="">— Not set —</option>
                  <option>Recurve</option>
                  <option>Compound</option>
                  <option>Barebow</option>
                  <option>Longbow</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Age category
                <select name="age_category" defaultValue={profile?.age_category ?? ""} className="input-field">
                  <option value="">— Not set —</option>
                  {["U12","U14","U15","U16","U18","Senior","50+","60+"].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Club
                <select name="club_id" defaultValue={profile?.club_id ?? ""} className="input-field">
                  <option value="">— None —</option>
                  {(clubs ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
          </fieldset>

          {/* Social media */}
          <fieldset className="card flex flex-col gap-4">
            <legend className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Social media</legend>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Add links to your accounts so you can pick where to post when sharing a score.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOCIAL_PLATFORMS.map(p => (
                <label key={p.key} className="flex flex-col gap-1 text-sm font-medium">
                  <span className="flex items-center gap-1.5">{p.icon} {p.label}</span>
                  <input type="url" name={`social_${p.key}`} defaultValue={socialLinks[p.key] ?? ""} placeholder={p.placeholder} className="input-field" />
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="btn-primary self-start">Save profile</button>
        </form>
      </div>

      {/* Trophy cabinet */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-xl font-bold">Trophy cabinet</h2>
          {trophyCount > 0 && (
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
              {trophyCount}
            </span>
          )}
        </div>
        {trophyCount > 0 && (
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            {trophyCount} {trophyCount === 1 ? "trophy" : "trophies"} — keep competing!
          </p>
        )}
        <TrophyCabinet trophies={trophies ?? []} />
      </div>
    </main>
  );
}
