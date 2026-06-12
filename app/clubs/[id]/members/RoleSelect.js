"use client";

import { ROLES, roleLabel } from "@/lib/permissions";

export default function RoleSelect({ clubId, profileId, role, action }) {
  return (
    <form action={action}>
      <input type="hidden" name="clubId" value={clubId} />
      <input type="hidden" name="profileId" value={profileId} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form.requestSubmit()}
        className="input-field py-1 text-sm"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabel(r)}
          </option>
        ))}
      </select>
    </form>
  );
}
