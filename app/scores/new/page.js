import { createClient } from "@/lib/supabase/server";
import { roundNames } from "@/lib/rounds";
import { addScore } from "./actions";

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
      <form action={addScore} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Round
          <select name="round_name" required className="input-field">
            {roundNames().map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Score
          <input
            type="number"
            name="score"
            required
            min={0}
            className="input-field"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Golds (optional)
          <input type="number" name="golds" min={0} className="input-field" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Date
          <input
            type="date"
            name="shot_at"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="input-field"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Bow type
          <select name="bow_type" className="input-field">
            <option>Recurve</option>
            <option>Compound</option>
            <option>Barebow</option>
            <option>Longbow</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Age category
          <select name="age_category" className="input-field">
            <option value="">— Not set —</option>
            <option>U12</option>
            <option>U14</option>
            <option>U15</option>
            <option>U16</option>
            <option>U18</option>
            <option>Senior</option>
            <option>50+</option>
            <option>60+</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Status
          <select name="status" className="input-field">
            <option>Practice</option>
            <option>Competition</option>
            <option>UKRS</option>
            <option>WRS</option>
          </select>
        </label>

        {clubs.length > 0 && (
          <label className="flex flex-col gap-1 text-sm">
            Club (optional)
            <select name="club_id" className="input-field">
              <option value="">— None —</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button type="submit" className="btn-primary">
          Save score
        </button>
      </form>
    </main>
  );
}
