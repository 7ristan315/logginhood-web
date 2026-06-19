"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

const BOW_TYPES = ["Recurve", "Compound", "Barebow", "Longbow"];
const LABELS_HIGH_FIRST = ["IGMB","IMB","IB1","IB2","IB3","IA1","IA2","IA3"];

const LABEL_NAMES = {
  IGMB: "Grand Master Bowman", IMB:  "Master Bowman",
  IB1:  "Bowman 1st",          IB2:  "Bowman 2nd",  IB3: "Bowman 3rd",
  IA1:  "Archer 1st",          IA2:  "Archer 2nd",  IA3: "Archer 3rd",
};

function fmt(n) { return n != null ? `£${Number(n).toFixed(2)}` : "—"; }

function StockRow({ bt, stock, saving, onSave }) {
  const [qty, setQty] = useState(String(stock?.quantity ?? 0));
  const [cost, setCost] = useState(stock?.cost_override != null ? String(stock.cost_override) : "");
  const dirty = qty !== String(stock?.quantity ?? 0) || cost !== (stock?.cost_override != null ? String(stock.cost_override) : "");
  return (
    <tr className="border-b border-accent-light last:border-0 hover:bg-accent-light/10">
      <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">
        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-xs font-bold text-accent mr-2">{bt.label}</span>
        {bt.bow_type ?? <em className="opacity-40">All bows</em>}
        {bt.is_custom && <span className="ml-2 text-xs opacity-40 italic">custom</span>}
      </td>
      <td className="px-3 py-2">
        <input
          type="number" min="0" value={qty}
          onChange={e => setQty(e.target.value)}
          className="w-16 rounded border border-accent-light bg-transparent px-2 py-1 text-sm tabular-nums text-center"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-40">£</span>
          <input
            type="number" min="0" step="0.50" value={cost}
            onChange={e => setCost(e.target.value)}
            placeholder={bt.default_cost ?? "3.50"}
            className="w-20 rounded border border-accent-light bg-transparent px-2 py-1 text-sm tabular-nums"
          />
          {!cost && <span className="text-xs opacity-40">(default {fmt(bt.default_cost)})</span>}
        </div>
      </td>
      <td className="px-3 py-2">
        {dirty && (
          <button
            onClick={() => onSave(bt.id, qty, cost)}
            disabled={saving === bt.id}
            className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving === bt.id ? "…" : "Save"}
          </button>
        )}
      </td>
    </tr>
  );
}

export default function BadgeAdminTab({ badgeTypes: initialBadgeTypes, badgeStock: initialStock, adminOrders: initialOrders, clubId, members }) {
  const [view, setView] = useState("orders");
  const [badgeTypes, setBadgeTypes] = useState(initialBadgeTypes ?? []);
  const [stockMap, setStockMap] = useState(
    Object.fromEntries((initialStock ?? []).map(s => [s.badge_type_id, s]))
  );
  const [orders, setOrders] = useState(initialOrders ?? []);
  const [saving, setSaving] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [orderFilter, setOrderFilter] = useState("pending");
  const [addingCustom, setAddingCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ label: "", bow_type: "", name: "", default_cost: "3.50" });
  const [assignForm, setAssignForm] = useState({ profile_id: "", role: "badge_admin" });
  const [assignMsg, setAssignMsg] = useState(null);
  const supabase = createClient();

  // Group standard badges by bow type for stock view
  const standardByBow = useMemo(() => {
    const map = {};
    for (const bow of BOW_TYPES) map[bow] = [];
    for (const bt of badgeTypes) {
      if (!bt.is_custom && bt.bow_type && map[bt.bow_type]) {
        map[bt.bow_type].push(bt);
      }
    }
    // Sort each bow's badges high → low
    for (const bow of BOW_TYPES) {
      map[bow].sort((a, b) => LABELS_HIGH_FIRST.indexOf(a.label) - LABELS_HIGH_FIRST.indexOf(b.label));
    }
    return map;
  }, [badgeTypes]);

  const customBadges = useMemo(() => badgeTypes.filter(bt => bt.is_custom), [badgeTypes]);

  async function saveStock(badgeTypeId, qty, cost) {
    setSaving(badgeTypeId);
    const { data } = await supabase
      .from("badge_stock")
      .upsert({
        club_id: clubId,
        badge_type_id: badgeTypeId,
        quantity: parseInt(qty) || 0,
        cost_override: cost ? parseFloat(cost) : null,
      }, { onConflict: "club_id,badge_type_id" })
      .select()
      .single();
    if (data) setStockMap(prev => ({ ...prev, [badgeTypeId]: data }));
    setSaving(null);
  }

  async function fulfillOrder(orderId) {
    setActionLoading(orderId + "_fulfil");
    const order = orders.find(o => o.id === orderId);
    const { data } = await supabase
      .from("badge_orders")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();
    if (data) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
      // Decrement stock
      if (order) {
        const stock = stockMap[order.badge_type_id];
        if (stock && stock.quantity > 0) {
          const newQty = stock.quantity - (order.quantity ?? 1);
          await supabase.from("badge_stock")
            .update({ quantity: Math.max(0, newQty) })
            .eq("club_id", clubId).eq("badge_type_id", order.badge_type_id);
          setStockMap(prev => ({ ...prev, [order.badge_type_id]: { ...stock, quantity: Math.max(0, newQty) } }));
        }
      }
    }
    setActionLoading(null);
  }

  async function markPaid(orderId, paid) {
    setActionLoading(orderId + "_paid");
    const { data } = await supabase
      .from("badge_orders")
      .update({ paid })
      .eq("id", orderId)
      .select()
      .single();
    if (data) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    setActionLoading(null);
  }

  async function cancelOrder(orderId) {
    setActionLoading(orderId + "_cancel");
    const { data } = await supabase
      .from("badge_orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .select()
      .single();
    if (data) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    setActionLoading(null);
  }

  async function addCustom() {
    if (!customForm.name || !customForm.label) return;
    const { data } = await supabase
      .from("badge_types")
      .insert({
        label: customForm.label.toUpperCase(),
        bow_type: customForm.bow_type || null,
        name: customForm.name,
        default_cost: parseFloat(customForm.default_cost) || 3.50,
        is_custom: true,
        club_id: clubId,
        sort_order: 5,
      })
      .select()
      .single();
    if (data) {
      setBadgeTypes(prev => [...prev, data]);
      setCustomForm({ label: "", bow_type: "", name: "", default_cost: "3.50" });
      setAddingCustom(false);
    }
  }

  async function assignRole() {
    if (!assignForm.profile_id) return;
    setAssignMsg(null);
    const { error } = await supabase
      .from("club_member_roles")
      .upsert({ club_id: clubId, profile_id: assignForm.profile_id, role: assignForm.role }, { onConflict: "club_id,profile_id,role" });
    setAssignMsg(error ? { type: "error", text: error.message } : { type: "ok", text: "Role assigned." });
    setTimeout(() => setAssignMsg(null), 3000);
  }

  const filteredOrders = orders.filter(o => orderFilter === "all" || o.status === orderFilter);
  const pendingCount = orders.filter(o => o.status === "pending").length;

  const badgeTypeMap = Object.fromEntries(badgeTypes.map(b => [b.id, b]));

  return (
    <div className="flex flex-col gap-6 pt-4">

      {/* Sub-nav */}
      <div className="tab-nav">
        {[
          { key: "orders", label: `Orders${pendingCount ? ` (${pendingCount})` : ""}` },
          { key: "stock",  label: "Stock & prices" },
          { key: "roles",  label: "Roles" },
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key)} className={view === t.key ? "active" : ""}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Orders ── */}
      {view === "orders" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {["pending","fulfilled","cancelled","all"].map(f => (
              <button
                key={f}
                onClick={() => setOrderFilter(f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize ${
                  orderFilter === f
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-accent-light hover:border-accent"
                }`}
              >
                {f} {f === "pending" && pendingCount ? `(${pendingCount})` : ""}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="card text-center py-8 text-sm opacity-40">No {orderFilter} orders.</div>
          )}

          <div className="flex flex-col gap-3">
            {filteredOrders.map(o => {
              const bt = badgeTypeMap[o.badge_type_id];
              const price = stockMap[o.badge_type_id]?.cost_override ?? bt?.default_cost;
              const total = price != null ? Number(price) * (o.quantity ?? 1) : null;
              return (
                <div key={o.id} className="card flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{o.profiles?.full_name ?? "Unknown"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        o.status === "fulfilled" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        o.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>{o.status}</span>
                      {o.paid && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Paid</span>}
                    </div>
                    <p className="text-sm opacity-70">
                      <span className="font-medium text-accent">{bt?.label ?? "?"}</span>
                      {" — "}{bt?.bow_type ?? ""}
                      {" · "}{o.quantity ?? 1}× {total != null ? `· ${fmt(total)}` : ""}
                    </p>
                    <p className="text-xs opacity-40 tabular-nums mt-0.5">{o.created_at?.slice(0, 10)}</p>
                    {o.notes && <p className="text-xs opacity-60 mt-1 italic">"{o.notes}"</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center self-center">
                    {o.status === "pending" && (
                      <>
                        <button
                          onClick={() => fulfillOrder(o.id)}
                          disabled={actionLoading === o.id + "_fulfil"}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {actionLoading === o.id + "_fulfil" ? "…" : "Mark fulfilled"}
                        </button>
                        <button
                          onClick={() => cancelOrder(o.id)}
                          disabled={actionLoading === o.id + "_cancel"}
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                        >
                          {actionLoading === o.id + "_cancel" ? "…" : "Cancel"}
                        </button>
                      </>
                    )}
                    {!o.paid && (
                      <button
                        onClick={() => markPaid(o.id, true)}
                        disabled={actionLoading === o.id + "_paid"}
                        className="rounded-lg border border-green-400 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 disabled:opacity-50"
                      >
                        {actionLoading === o.id + "_paid" ? "…" : "Mark paid"}
                      </button>
                    )}
                    {o.paid && o.status === "fulfilled" && (
                      <button
                        onClick={() => markPaid(o.id, false)}
                        className="text-xs opacity-30 hover:opacity-60 underline"
                      >
                        Undo paid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stock & prices ── */}
      {view === "stock" && (
        <div className="flex flex-col gap-6">
          <p className="text-sm opacity-60">
            Set how many of each badge you have in stock and optionally override the default price.
            Stock decrements automatically when you mark an order as fulfilled.
          </p>

          {BOW_TYPES.map(bow => (
            <div key={bow}>
              <h3 className="mb-2 text-sm font-semibold opacity-70 uppercase tracking-wide">{bow}</h3>
              <div className="overflow-x-auto rounded-xl border border-accent-light">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-accent-light bg-accent-light/30">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide opacity-50">Badge</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide opacity-50 w-24">In stock</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide opacity-50">Price</th>
                      <th className="px-3 py-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {standardByBow[bow].map(bt => (
                      <StockRow
                        key={bt.id}
                        bt={bt}
                        stock={stockMap[bt.id]}
                        saving={saving}
                        onSave={saveStock}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Custom badges */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold opacity-70 uppercase tracking-wide">Custom badges</h3>
              <button
                onClick={() => setAddingCustom(v => !v)}
                className="rounded-lg border border-accent px-3 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                + Add custom badge
              </button>
            </div>

            {addingCustom && (
              <div className="card mb-4 flex flex-col gap-3">
                <p className="text-sm font-medium">New custom badge</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs opacity-50">Short label</label>
                    <input
                      value={customForm.label}
                      onChange={e => setCustomForm(f => ({ ...f, label: e.target.value }))}
                      placeholder="e.g. CLUB1"
                      className="w-full rounded border border-accent-light bg-transparent px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs opacity-50">Bow type (optional)</label>
                    <select
                      value={customForm.bow_type}
                      onChange={e => setCustomForm(f => ({ ...f, bow_type: e.target.value }))}
                      className="w-full rounded border border-accent-light bg-transparent px-2 py-1.5 text-sm"
                    >
                      <option value="">All / not specified</option>
                      {BOW_TYPES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs opacity-50">Full name</label>
                    <input
                      value={customForm.name}
                      onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Club Champion Badge"
                      className="w-full rounded border border-accent-light bg-transparent px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs opacity-50">Default price (£)</label>
                    <input
                      type="number" step="0.50" min="0"
                      value={customForm.default_cost}
                      onChange={e => setCustomForm(f => ({ ...f, default_cost: e.target.value }))}
                      className="w-full rounded border border-accent-light bg-transparent px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addCustom} className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90">
                    Add badge
                  </button>
                  <button onClick={() => setAddingCustom(false)} className="rounded-lg border border-accent-light px-4 py-1.5 text-xs font-medium opacity-60 hover:opacity-100">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {customBadges.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-accent-light">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-accent-light bg-accent-light/30">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide opacity-50">Badge</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide opacity-50 w-24">In stock</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide opacity-50">Price</th>
                      <th className="px-3 py-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customBadges.map(bt => (
                      <StockRow key={bt.id} bt={bt} stock={stockMap[bt.id]} saving={saving} onSave={saveStock} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !addingCustom && <p className="text-sm opacity-40">No custom badges added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Roles ── */}
      {view === "roles" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-60">
            Assign additional roles to club members. A member can hold multiple roles.
          </p>

          <div className="card flex flex-col gap-3">
            <p className="text-sm font-medium">Assign role</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs opacity-50">Member</label>
                <select
                  value={assignForm.profile_id}
                  onChange={e => setAssignForm(f => ({ ...f, profile_id: e.target.value }))}
                  className="w-full rounded border border-accent-light bg-transparent px-2 py-1.5 text-sm"
                >
                  <option value="">Select member…</option>
                  {(members ?? []).map(m => (
                    <option key={m.profile_id} value={m.profile_id}>{m.profiles?.full_name ?? m.profile_id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs opacity-50">Role</label>
                <select
                  value={assignForm.role}
                  onChange={e => setAssignForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full rounded border border-accent-light bg-transparent px-2 py-1.5 text-sm"
                >
                  {["badge_admin","records_keeper","welfare_officer","tournament_org","coach"].map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={assignRole}
                disabled={!assignForm.profile_id}
                className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40"
              >
                Assign role
              </button>
              {assignMsg && (
                <span className={`text-xs ${assignMsg.type === "error" ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                  {assignMsg.text}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
