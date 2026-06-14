"use client";

import { deleteClub } from "./actions";

export default function DeleteClubButton({ clubId, clubName }) {
  return (
    <form
      action={deleteClub}
      onSubmit={(e) => {
        if (!confirm(`Delete "${clubName}"? This removes its membership records and can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="clubId" value={clubId} />
      <button type="submit" className="btn-secondary text-sm text-red-600">
        Delete
      </button>
    </form>
  );
}
