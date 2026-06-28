"use client";

import { useState } from "react";
import { generateCodes } from "./actions";

export default function CodesClient({ batches, stats }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate(formData) {
    setLoading(true);
    setResult(null);
    const res = await generateCodes(formData);
    setResult(res);
    setLoading(false);
  }

  function downloadCSV(batch) {
    const rows = batch.codes.map(c => `${c.code},${c.brand},${c.product_name || ""},${c.redeemed_by ? "redeemed" : "available"}`);
    const csv = `Code,Brand,Product,Status\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logginhood-codes-${batch.name || "batch"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Generator */}
      <div className="card">
        <h2 className="text-base font-semibold mb-1">Generate activation codes</h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
          Codes give archers free Premium when they redeem. Bundle with equipment packaging.
        </p>
        <form action={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Brand *
            <input name="brand" required placeholder="e.g. Hoyt" className="input-field" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Product name
            <input name="product" placeholder="e.g. Xceed" className="input-field" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Category
            <select name="category" className="input-field">
              <option value="">— Any —</option>
              {["riser", "limbs", "sight", "arrows", "stabiliser", "release_aid", "scope", "button", "tab", "other"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Bow type
            <select name="bow_type" className="input-field">
              <option value="">— Any —</option>
              {["Recurve", "Compound", "Barebow", "Longbow"].map(b => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Batch name
            <input name="batch_name" placeholder="e.g. Q3 2026 UK Launch" className="input-field" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Number of codes
            <input name="count" type="number" min="1" max="5000" defaultValue="100" className="input-field" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Premium months per code
            <input name="months" type="number" min="1" max="24" defaultValue="12" className="input-field" />
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="btn-primary w-full" style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? "Generating..." : "Generate codes"}
            </button>
          </div>
        </form>

        {result?.success && (
          <div className="mt-4 p-3 rounded-lg" style={{ background: "var(--success-light)", color: "var(--success-text)" }}>
            <p className="text-sm font-semibold">{result.count} codes generated!</p>
            <p className="text-xs mt-1">Sample: {result.sample.join(", ")}</p>
          </div>
        )}
        {result?.error && (
          <p className="mt-3 text-sm font-medium" style={{ color: "var(--danger)" }}>{result.error}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total codes", value: stats.total, color: "var(--chart-1)" },
          { label: "Redeemed", value: stats.redeemed, color: "var(--chart-2)" },
          { label: "Available", value: stats.total - stats.redeemed, color: "var(--chart-3)" },
          { label: "Redemption rate", value: stats.total > 0 ? `${Math.round(stats.redeemed / stats.total * 100)}%` : "—", color: "var(--chart-5)" },
        ].map(s => (
          <div key={s.label} className="card flex flex-col gap-1" style={{ borderTop: `3px solid ${s.color}` }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{s.label}</span>
            <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Batches */}
      {batches.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold mb-3">Code batches</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Batch", "Brand", "Product", "Total", "Redeemed", "Rate", "Created", ""].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="py-2 px-3 font-medium">{b.name || "—"}</td>
                    <td className="py-2 px-3">{b.brand}</td>
                    <td className="py-2 px-3">{b.product || "—"}</td>
                    <td className="py-2 px-3 font-semibold">{b.total}</td>
                    <td className="py-2 px-3" style={{ color: "var(--accent)" }}>{b.redeemed}</td>
                    <td className="py-2 px-3">
                      <span className="text-xs font-semibold py-0.5 px-2 rounded-full"
                        style={{
                          background: b.redeemed / b.total > 0.5 ? "var(--success-light)" : b.redeemed / b.total > 0.2 ? "var(--warning-light)" : "var(--surface-3)",
                          color: b.redeemed / b.total > 0.5 ? "var(--success-text)" : b.redeemed / b.total > 0.2 ? "var(--warning-text)" : "var(--text-secondary)",
                        }}>
                        {b.total > 0 ? Math.round(b.redeemed / b.total * 100) : 0}%
                      </span>
                    </td>
                    <td className="py-2 px-3" style={{ color: "var(--text-tertiary)" }}>{b.created}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => downloadCSV(b)} className="btn-ghost text-xs py-1 px-2">CSV</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
