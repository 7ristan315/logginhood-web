import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roundNames } from "@/lib/rounds";
import { createCompetition } from "./actions";

export default async function NewCompetitionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, platform_admin")
    .eq("id", user.id)
    .single();

  const { data: myMemberships } = await supabase
    .from("club_members")
    .select("role, club_id, clubs(id, name)")
    .eq("profile_id", user.id);

  const canCreate =
    profile?.platform_admin ||
    (myMemberships ?? []).some((m) => ["coach", "records_keeper", "chairman"].includes(m.role));

  if (!canCreate) redirect("/competitions");

  const clubs = (myMemberships ?? []).map((m) => m.clubs).filter(Boolean);

  const today = new Date().toISOString().slice(0, 10);
  const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Create competition</h1>
        <p className="mt-1 text-sm opacity-60">
          Set up an online competition — archers submit scores they shoot during the competition window.
        </p>
      </div>

      <form action={createCompetition} className="flex flex-col gap-5">
        {/* Name */}
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Competition name <span className="text-red-500">*</span>
          <input
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Summer Indoor Challenge 2026"
            className="input-field font-normal"
          />
        </label>

        {/* Description */}
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Description
          <textarea
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Tell archers what this competition is about…"
            className="input-field resize-none font-normal"
          />
        </label>

        {/* Round */}
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Round <span className="text-red-500">*</span>
          <select name="round_name" required className="input-field font-normal">
            <option value="">— Select a round —</option>
            <optgroup label="Indoor">
              {["Bray I","Bray II","Portsmouth","Stafford","WA 18m","WA 25m","Worcester"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </optgroup>
            <optgroup label="Outdoor">
              {["York","Hereford","Windsor","National","WA 70m","WA 60m","WA 1440 (Gents)","WA 1440 (Ladies)"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </optgroup>
          </select>
        </label>

        {/* Bow type filter */}
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Bow type restriction
          <select name="bow_type" className="input-field font-normal">
            <option value="">Open to all bow types</option>
            <option>Recurve</option>
            <option>Compound</option>
            <option>Barebow</option>
            <option>Longbow</option>
          </select>
        </label>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Start date <span className="text-red-500">*</span>
            <input type="date" name="start_date" required defaultValue={today} min={today} className="input-field font-normal" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            End date <span className="text-red-500">*</span>
            <input type="date" name="end_date" required defaultValue={twoWeeks} min={today} className="input-field font-normal" />
          </label>
        </div>

        {/* Max entries */}
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Max entries
          <input
            type="number"
            name="max_entries"
            min={2}
            max={1000}
            placeholder="Leave blank for unlimited"
            className="input-field font-normal"
          />
        </label>

        {/* Club association */}
        {clubs.length > 0 && (
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Hosted by (club)
            <select name="club_id" className="input-field font-normal">
              <option value="">— Individual (no club) —</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        )}

        {/* Prizes toggle */}
        <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: "var(--accent-light)" }}>
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="has_prizes" value="1" defaultChecked className="h-4 w-4 accent-[color:var(--accent)]" />
            <div>
              <p className="text-sm font-medium">🏆 Award virtual trophies</p>
              <p className="text-xs opacity-60">Gold, silver and bronze trophies are added to the winners&apos; trophy cabinets.</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">Create competition</button>
          <a href="/competitions" className="btn-secondary text-center">Cancel</a>
        </div>
      </form>
    </main>
  );
}
