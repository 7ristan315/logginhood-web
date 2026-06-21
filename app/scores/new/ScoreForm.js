"use client";

import { useState } from "react";
import { roundNames } from "@/lib/rounds";
import SightMarkBanner from "./SightMarkBanner";

const BOW_TYPES = ["Recurve", "Compound", "Barebow", "Longbow"];
const STATUSES = ["Practice", "Competition", "UKRS", "WRS"];
const AGE_CATS = ["", "U12", "U14", "U15", "U16", "U18", "Senior", "50+", "60+"];

export default function ScoreForm({ clubs, action }) {
  const [round, setRound] = useState(roundNames()[0]);
  const [bowType, setBowType] = useState("Recurve");

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Round
        <select name="round_name" required className="input-field"
          value={round} onChange={e => setRound(e.target.value)}>
          {roundNames().map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Bow type
        <select name="bow_type" className="input-field"
          value={bowType} onChange={e => setBowType(e.target.value)}>
          {BOW_TYPES.map(b => <option key={b}>{b}</option>)}
        </select>
      </label>

      <SightMarkBanner roundName={round} bowType={bowType} />

      <label className="flex flex-col gap-1 text-sm">
        Score
        <input type="number" name="score" required min={0} className="input-field" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Golds (optional)
        <input type="number" name="golds" min={0} className="input-field" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Date
        <input type="date" name="shot_at" required
          defaultValue={new Date().toISOString().slice(0, 10)} className="input-field" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Age category
        <select name="age_category" className="input-field">
          {AGE_CATS.map(a => <option key={a} value={a}>{a || "— Not set —"}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Status
        <select name="status" className="input-field">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </label>

      {clubs.length > 0 && (
        <label className="flex flex-col gap-1 text-sm">
          Club (optional)
          <select name="club_id" className="input-field">
            <option value="">— None —</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      )}

      <button type="submit" className="btn-primary">Save score</button>
    </form>
  );
}
