"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge, Dialog, DialogFooter } from "@/components/ui";
import { createClub, joinClub } from "./actions";

export default function ClubsClient({ clubs, governingBodies, user, memberClubIds, pendingClubIds }) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return clubs || [];
    const q = search.toLowerCase();
    return (clubs || []).filter(c =>
      c.name.toLowerCase().includes(q) || (c.location || "").toLowerCase().includes(q)
    );
  }, [clubs, search]);

  const memberSet = new Set(memberClubIds);
  const pendingSet = new Set(pendingClubIds);

  return (
    <>
      {/* Search + create */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: "var(--text-tertiary)" }}>⌕</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clubs…"
            className="w-full py-2.5 pl-9 pr-3 text-sm rounded-full border"
            style={{ background: "var(--surface-1)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        {user && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            + Propose a club
          </button>
        )}
      </div>

      {/* Results */}
      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {filtered.length} club{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-12 text-center">
          <span className="text-3xl">🏛️</span>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {search ? "No clubs match your search." : "No clubs registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(club => (
            <div key={club.id} className="card flex flex-col gap-2 hover:shadow-md transition-shadow" style={{ transition: "box-shadow var(--transition-normal)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/clubs/${club.id}`} className="font-semibold text-sm hover:underline" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    {club.name}
                  </Link>
                  {club.location && <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{club.location}</p>}
                  {club.governing_bodies?.name && <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{club.governing_bodies.name}</p>}
                </div>
                {club.status === "verified" ? (
                  <Badge variant="success">Verified</Badge>
                ) : club.status === "pending" ? (
                  <Badge variant="warning">Pending</Badge>
                ) : null}
              </div>
              <div className="mt-auto pt-1">
                {user && !memberSet.has(club.id) && !pendingSet.has(club.id) && (
                  <form action={joinClub}>
                    <input type="hidden" name="clubId" value={club.id} />
                    <button type="submit" className="btn-secondary text-xs w-full">Join club</button>
                  </form>
                )}
                {user && pendingSet.has(club.id) && (
                  <span className="text-xs font-medium" style={{ color: "var(--warning)" }}>Application pending</span>
                )}
                {user && memberSet.has(club.id) && (
                  <span className="text-xs font-medium" style={{ color: "var(--success)" }}>Member</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create club dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Propose a club" description="New clubs start as pending until reviewed. You'll become chairman once approved.">
        <form action={async (fd) => { await createClub(fd); setShowCreate(false); }} className="flex flex-col gap-3 mt-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Club name *
            <input name="name" required className="input-field" placeholder="e.g. Phoenix Bowmen" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Location
            <input name="location" className="input-field" placeholder="City or region" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Governing body
            <select name="governingBodyId" className="input-field" defaultValue="">
              <option value="">— Select —</option>
              {governingBodies?.map(gb => <option key={gb.id} value={gb.id}>{gb.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Affiliation number
            <input name="affiliationNumber" className="input-field" placeholder="Optional" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Official club email
            <input name="officialEmail" type="email" className="input-field" placeholder="If it matches your email, approval is faster" />
          </label>
          <DialogFooter>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">Submit for review</button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
