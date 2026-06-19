"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LBL, bestClassForBow, nextTargetInfo } from "@/lib/classification";

const BOW_ICON = { Recurve: "🏹", Compound: "⚙️", Barebow: "🎯", Longbow: "🌲" };

const LABEL_NAMES = {
  IGMB: "Grand Master Bowman",
  IMB:  "Master Bowman",
  IB1:  "Bowman 1st Class",
  IB2:  "Bowman 2nd Class",
  IB3:  "Bowman 3rd Class",
  IA1:  "Archer 1st Class",
  IA2:  "Archer 2nd Class",
  IA3:  "Archer 3rd Class",
};

// IGMB first for display
const DISPLAY_ORDER = [...LBL].reverse();

export default function BadgesTab({ userProfile, userScores, badgeTypes, badgeStock, badgeOrders: initialOrders, clubId }) {
  const [orders, setOrders] = useState(initialOrders ?? []);
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const supabase = createClient();

  const userId = userProfile?.id;
  const gender = userProfile?.gender;
  const ageCategory = userProfile?.age_category;

  // Bow types the user has shot — fall back to profile default
  const bowTypes = [...new Set((userScores ?? []).map(s => s.bow_type).filter(Boolean))];
  if (!bowTypes.length && userProfile?.bow_type) bowTypes.push(userProfile.bow_type);

  // Best classification per bow type
  const bestPerBow = {};
  for (const bow of bowTypes) {
    bestPerBow[bow] = bestClassForBow(userScores ?? [], userId, bow, gender, ageCategory);
  }

  // badge_type_id → stock row
  const stockMap = Object.fromEntries((badgeStock ?? []).map(s => [s.badge_type_id, s]));

  // badge_type_id → most recent order (prefer pending > fulfilled > cancelled)
  const orderMap = {};
  for (const o of orders) {
    const existing = orderMap[o.badge_type_id];
    const priority = { pending: 2, fulfilled: 1, cancelled: 0 };
    if (!existing || (priority[o.status] ?? 0) > (priority[existing.status] ?? 0)) {
      orderMap[o.badge_type_id] = o;
    }
  }

  // "label|bow_type" → badge_type row
  const badgeMap = {};
  for (const bt of badgeTypes ?? []) {
    badgeMap[`${bt.label}|${bt.bow_type}`] = bt;
  }

  async function placeOrder(badgeType) {
    setLoading(badgeType.id);
    setMsg(null);
    const { data, error } = await supabase
      .from("badge_orders")
      .insert({ profile_id: userId, club_id: clubId, badge_type_id: badgeType.id, quantity: 1, status: "pending", paid: false })
      .select()
      .single();
    if (error) setMsg({ type: "error", text: error.message });
    else {
      setOrders(prev => [data, ...prev]);
      setMsg({ type: "ok", text: `Order placed for ${badgeType.label} — ${badgeType.bow_type}` });
      setTimeout(() => setMsg(null), 4000);
    }
    setLoading(null);
  }

  if (!userId) return <p className="pt-4 text-sm opacity-50">Sign in to view your badges.</p>;

  return (
    <div className="flex flex-col gap-10 pt-4">

      {bowTypes.length === 0 && (
        <div className="card py-12 text-center text-sm opacity-50">
          No scores recorded yet. Shoot some rounds to earn badges!
        </div>
      )}

      {bowTypes.map(bow => {
        const best = bestPerBow[bow];
        const bestIdx = best ? LBL.indexOf(best) : -1;
        const next = nextTargetInfo(bow, ageCategory, gender, best);
        const earnedCount = bestIdx + 1; // e.g. bestIdx=5 → earned 6 labels (IA3…IB1)

        return (
          <section key={bow}>
            {/* Bow header */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-2xl">{BOW_ICON[bow] ?? "🏹"}</span>
              <h2 className="text-lg font-semibold">{bow}</h2>
              {best ? (
                <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground">
                  {best} — {LABEL_NAMES[best]}
                </span>
              ) : (
                <span className="rounded-full border border-dashed px-3 py-0.5 text-xs opacity-40">
                  No classification yet
                </span>
              )}
              {earnedCount > 0 && (
                <span className="ml-auto text-xs opacity-50">{earnedCount}/8 earned</span>
              )}
            </div>

            {/* Next target callout */}
            {next && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent bg-accent/5 p-3">
                <span className="text-xl mt-0.5">🎯</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Next: {next.label} — {LABEL_NAMES[next.label]}</p>
                  <p className="text-xs opacity-60 mt-0.5 leading-relaxed">
                    {next.opportunities.slice(0, 3).map(o => (
                      <span key={o.round} className="mr-3">{o.round}: <strong>{o.threshold}+</strong></span>
                    ))}
                  </p>
                </div>
              </div>
            )}

            {!next && best && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-green-400 bg-green-50 dark:bg-green-950/30 p-3">
                <span className="text-xl">🏆</span>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Maximum classification achieved — Indoor Grand Master Bowman!
                </p>
              </div>
            )}

            {/* Badge grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DISPLAY_ORDER.map(label => {
                const earned = bestIdx >= LBL.indexOf(label);
                const badgeType = badgeMap[`${label}|${bow}`];
                const existingOrder = badgeType ? orderMap[badgeType.id] : null;
                const stock = badgeType ? stockMap[badgeType.id] : null;
                const price = stock?.cost_override ?? badgeType?.default_cost;
                const alreadyOrdered = existingOrder?.status === "pending" || existingOrder?.status === "fulfilled";
                const canOrder = earned && badgeType && !alreadyOrdered;

                return (
                  <div
                    key={label}
                    className={`flex flex-col gap-2 rounded-xl border p-3 transition-all ${
                      earned
                        ? "border-accent/40 bg-accent/5"
                        : "border-dashed border-accent-light opacity-40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-lg font-bold leading-none ${earned ? "text-accent" : "opacity-30"}`}>
                        {earned ? "✓" : "○"}
                      </span>
                      <span className="text-xs font-bold opacity-50 tabular-nums">{label}</span>
                    </div>

                    <p className="text-xs font-medium leading-snug">{LABEL_NAMES[label]}</p>

                    {/* Progress hint for the next badge */}
                    {!earned && next?.label === label && (
                      <p className="text-xs opacity-50 leading-tight">
                        {next.opportunities[0]?.threshold}+ on {next.opportunities[0]?.round}
                      </p>
                    )}

                    {/* Order action */}
                    {earned && (
                      <div className="mt-auto pt-1">
                        {existingOrder?.status === "fulfilled" && (
                          <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                            ✓ Received
                          </span>
                        )}
                        {existingOrder?.status === "pending" && (
                          <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
                            ⏳ On order
                          </span>
                        )}
                        {canOrder && !badgeType && (
                          <span className="text-xs opacity-30">Not stocked</span>
                        )}
                        {canOrder && badgeType && (
                          <button
                            onClick={() => placeOrder(badgeType)}
                            disabled={loading === badgeType.id}
                            className="w-full rounded-lg border border-accent px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                          >
                            {loading === badgeType.id
                              ? "…"
                              : `Order${price != null ? ` · £${Number(price).toFixed(2)}` : ""}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Feedback */}
      {msg && (
        <p className={`text-sm ${msg.type === "error" ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
          {msg.text}
        </p>
      )}

      {/* Order history */}
      {orders.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Your badge orders</h2>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent-light">
                  {["Badge", "Bow", "Date", "Status", "Paid"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide opacity-50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const bt = (badgeTypes ?? []).find(b => b.id === o.badge_type_id);
                  return (
                    <tr key={o.id} className="border-b border-accent-light last:border-0 hover:bg-accent-light/20">
                      <td className="px-4 py-2.5 font-medium">{bt?.label ?? "—"}</td>
                      <td className="px-4 py-2.5 opacity-70">{bt?.bow_type ?? "—"}</td>
                      <td className="px-4 py-2.5 tabular-nums opacity-60">{o.created_at?.slice(0, 10)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          o.status === "fulfilled"  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          o.status === "cancelled"  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {o.paid
                          ? <span className="text-green-600 dark:text-green-400 font-medium">✓ Paid</span>
                          : <span className="opacity-40">Unpaid</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
