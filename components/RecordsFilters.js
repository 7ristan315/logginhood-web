"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FILTER_FIELDS } from "@/lib/records";

export default function RecordsFilters({ roundOptions, selectedRound, world, filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  function writeFilters(rows) {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_FIELDS.forEach((_, i) => {
      params.delete(`var${i + 1}`);
      params.delete(`val${i + 1}`);
    });
    rows.forEach((row, i) => {
      params.set(`var${i + 1}`, row.var);
      params.set(`val${i + 1}`, row.val);
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  function addFilter() {
    const used = new Set(filters.map((f) => f.var));
    const next = FILTER_FIELDS.find((f) => !used.has(f.key));
    if (!next) return;
    writeFilters([...filters, { var: next.key, val: next.options[0] }]);
  }

  function updateFilter(i, patch) {
    const rows = filters.map((row, idx) => {
      if (idx !== i) return row;
      const merged = { ...row, ...patch };
      if (patch.var) {
        // Switching the variable: reset to its first option.
        const field = FILTER_FIELDS.find((f) => f.key === patch.var);
        merged.val = field.options[0];
      }
      return merged;
    });
    writeFilters(rows);
  }

  function removeFilter(i) {
    writeFilters(filters.filter((_, idx) => idx !== i));
  }

  const usedVars = new Set(filters.map((f) => f.var));
  const canAddFilter = filters.length < FILTER_FIELDS.length;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-accent-light bg-accent-light/40 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium opacity-70">Round</span>
          <select
            className="input-field min-w-[12rem]"
            value={selectedRound}
            onChange={(e) => update({ round: e.target.value })}
          >
            {roundOptions.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} ({r.count})
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium opacity-70">Scope</span>
          <div className="tab-nav m-0 border-none">
            <button
              type="button"
              className={!world ? "active" : ""}
              onClick={() => update({ world: null })}
            >
              This club
            </button>
            <button
              type="button"
              className={world ? "active" : ""}
              onClick={() => update({ world: "1" })}
            >
              🌍 World
            </button>
          </div>
        </div>

        {canAddFilter && (
          <button type="button" className="btn-secondary text-sm" onClick={addFilter}>
            + Add filter
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((row, i) => {
            const field = FILTER_FIELDS.find((f) => f.key === row.var);
            const available = FILTER_FIELDS.filter(
              (f) => f.key === row.var || !usedVars.has(f.key)
            );
            return (
              <div key={i} className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5">
                <select
                  className="input-field border-none bg-transparent p-0 text-sm"
                  value={row.var}
                  onChange={(e) => updateFilter(i, { var: e.target.value })}
                >
                  {available.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <span className="text-sm opacity-50">=</span>
                <select
                  className="input-field border-none bg-transparent p-0 text-sm"
                  value={row.val}
                  onChange={(e) => updateFilter(i, { val: e.target.value })}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-sm opacity-50 hover:opacity-100"
                  onClick={() => removeFilter(i)}
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
