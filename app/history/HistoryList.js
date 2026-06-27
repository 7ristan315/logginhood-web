"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { normPct } from "@/lib/rounds";

const CLS_COLOUR = {
  IGMB: "#a855f7", IMB: "#8b5cf6",
  IB1: "#3b82f6", IB2: "#60a5fa", IB3: "#93c5fd",
  IA1: "#22c55e", IA2: "#4ade80", IA3: "#86efac",
};

export default function HistoryList({ scores }) {
  const [search, setSearch] = useState("");
  const [bowFilter, setBowFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState("shot_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const rounds = useMemo(() => [...new Set(scores.map(s => s.round_name))].sort(), [scores]);
  const bows = useMemo(() => [...new Set(scores.map(s => s.bow_type).filter(Boolean))].sort(), [scores]);
  const statuses = useMemo(() => [...new Set(scores.map(s => s.status).filter(Boolean))].sort(), [scores]);

  const filtered = useMemo(() => {
    let result = scores;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.round_name.toLowerCase().includes(q));
    }
    if (bowFilter) result = result.filter(s => s.bow_type === bowFilter);
    if (statusFilter) result = result.filter(s => s.status === statusFilter);
    result = [...result].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [scores, search, bowFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  }

  const sortIcon = (key) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: "var(--text-tertiary)" }}>⌕</span>
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search rounds…"
            className="w-full py-2 pl-9 pr-3 text-sm rounded-full border"
            style={{ background: "var(--surface-1)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <select value={bowFilter} onChange={e => { setBowFilter(e.target.value); setPage(1); }}
          className="text-sm py-2 px-3 rounded-full border cursor-pointer"
          style={{ background: bowFilter ? "var(--accent-light)" : "var(--surface-1)", borderColor: bowFilter ? "var(--accent)" : "var(--border)", color: bowFilter ? "var(--accent)" : "var(--text-primary)", fontWeight: bowFilter ? 600 : 400 }}>
          <option value="">All bows</option>
          {bows.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm py-2 px-3 rounded-full border cursor-pointer"
          style={{ background: statusFilter ? "var(--accent-light)" : "var(--surface-1)", borderColor: statusFilter ? "var(--accent)" : "var(--border)", color: statusFilter ? "var(--accent)" : "var(--text-primary)", fontWeight: statusFilter ? 600 : 400 }}>
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || bowFilter || statusFilter) && (
          <button onClick={() => { setSearch(""); setBowFilter(""); setStatusFilter(""); setPage(1); }}
            className="text-xs font-semibold py-2 px-3 rounded-full border-none cursor-pointer"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {filtered.length} round{filtered.length !== 1 ? "s" : ""}
        {(search || bowFilter || statusFilter) ? " matching" : " total"}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center" style={{ color: "var(--text-tertiary)" }}>
          <span className="text-3xl">🔍</span>
          <p className="text-sm">No rounds match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                {[
                  { key: "round_name", label: "Round" },
                  { key: "score", label: "Score" },
                  { key: "golds", label: "Golds" },
                  { key: "bow_type", label: "Bow" },
                  { key: "classification", label: "Class." },
                  { key: "shot_at", label: "Date" },
                  { key: "status", label: "Status" },
                ].map(col => (
                  <th key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none"
                    style={{ padding: "10px 14px", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>
                    {col.label}{sortIcon(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(s => {
                const pct = normPct(s.score, s.round_name);
                return (
                  <tr key={s.id} className="group" style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <Link href={`/history/${s.id}`} className="font-medium hover:underline" style={{ color: "var(--accent)", textDecoration: "none" }}>
                        {s.round_name}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span className="font-bold text-base" style={{ color: "var(--accent)" }}>{s.score}</span>
                      {pct != null && <span className="text-xs ml-1.5" style={{ color: "var(--text-tertiary)" }}>{pct}%</span>}
                    </td>
                    <td style={{ padding: "10px 14px" }}>{s.golds}</td>
                    <td style={{ padding: "10px 14px" }}>{s.bow_type || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      {s.classification && s.classification !== "—" ? (
                        <span className="text-xs font-semibold py-0.5 px-2 rounded-full"
                          style={{ background: `${CLS_COLOUR[s.classification] || "var(--accent)"}20`, color: CLS_COLOUR[s.classification] || "var(--accent)" }}>
                          {s.classification}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{s.shot_at}</td>
                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{s.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="flex items-center justify-center min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg border cursor-pointer"
            style={{ background: "transparent", borderColor: "var(--border)", color: page <= 1 ? "var(--text-tertiary)" : "var(--text-primary)", opacity: page <= 1 ? 0.4 : 1 }}>
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className="flex items-center justify-center min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg border cursor-pointer"
              style={{ background: p === page ? "var(--accent)" : "transparent", borderColor: p === page ? "var(--accent)" : "var(--border)", color: p === page ? "var(--accent-foreground)" : "var(--text-primary)" }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="flex items-center justify-center min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg border cursor-pointer"
            style={{ background: "transparent", borderColor: "var(--border)", color: page >= totalPages ? "var(--text-tertiary)" : "var(--text-primary)", opacity: page >= totalPages ? 0.4 : 1 }}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
