import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, gb_number, gender, date_of_birth, bow_type, age_category, club_id")
    .eq("id", user.id)
    .single();

  const { data: clubs } = await supabase.from("clubs").select("id, name").order("name");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <form action={updateProfile} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            className="input-field"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Archery GB number
          <input
            name="gb_number"
            defaultValue={profile?.gb_number ?? ""}
            placeholder="GB123456"
            className="input-field"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Gender
          <select name="gender" defaultValue={profile?.gender ?? ""} className="input-field">
            <option value="">— Not set —</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Date of birth
          <input
            type="date"
            name="date_of_birth"
            defaultValue={profile?.date_of_birth ?? ""}
            className="input-field"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Bow type
          <select name="bow_type" defaultValue={profile?.bow_type ?? ""} className="input-field">
            <option value="">— Not set —</option>
            <option>Recurve</option>
            <option>Compound</option>
            <option>Barebow</option>
            <option>Longbow</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Age category
          <select
            name="age_category"
            defaultValue={profile?.age_category ?? ""}
            className="input-field"
          >
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
          Club
          <select
            name="club_id"
            defaultValue={profile?.club_id ?? ""}
            className="input-field"
          >
            <option value="">— None —</option>
            {(clubs ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn-primary">
          Save profile
        </button>
      </form>
    </main>
  );
}
