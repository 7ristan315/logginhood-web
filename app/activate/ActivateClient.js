"use client";

import { useState } from "react";
import { redeemCode } from "./actions";

export default function ActivateClient({ user, existingSub }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    setResult(null);
    const res = await redeemCode(formData);
    setResult(res);
    setLoading(false);
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold">Premium activated!</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Thanks to <strong>{result.brand}</strong>{result.product ? ` — ${result.product}` : ""}.
          You have {result.months} months of Logginhood Premium.
        </p>
        <div className="card flex flex-col gap-2 w-full max-w-sm text-left text-sm mt-2">
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Tier</span><span className="font-semibold" style={{ color: "var(--accent)" }}>Premium</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Duration</span><span>{result.months} months</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Sponsor</span><span>{result.brand}</span></div>
        </div>
        <div className="flex gap-3 mt-4">
          <a href="/dashboard" className="btn-primary">Go to dashboard</a>
          <a href="/my-setup" className="btn-secondary">Set up equipment</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="text-5xl">🏹</span>
      <div>
        <h2 className="text-xl font-bold">Activate your code</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Enter the activation code from your equipment packaging to unlock Logginhood Premium.
        </p>
      </div>

      {existingSub && (
        <div className="alert-info text-sm w-full max-w-sm text-left" style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--info-light)", color: "var(--info-text)", border: "1px solid var(--info)" }}>
          You already have Premium (expires {new Date(existingSub.expires_at).toLocaleDateString("en-GB")}). A new code will extend your subscription.
        </div>
      )}

      {!user ? (
        <div className="card flex flex-col gap-3 w-full max-w-sm">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Please log in to redeem your code.</p>
          <div className="flex gap-3">
            <a href="/login" className="btn-primary flex-1 text-center">Log in</a>
            <a href="/signup" className="btn-secondary flex-1 text-center">Sign up</a>
          </div>
        </div>
      ) : (
        <form action={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
          <input
            name="code"
            placeholder="e.g. HOYT-XCEED-A1B2C3"
            required
            className="input-field text-center text-lg tracking-widest uppercase"
            style={{ letterSpacing: "0.15em", fontFamily: "var(--font-mono, monospace)" }}
            autoFocus
            autoComplete="off"
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "Redeeming..." : "Activate code"}
          </button>
          {result?.error && (
            <p className="text-sm font-medium" style={{ color: "var(--danger)" }}>{result.error}</p>
          )}
        </form>
      )}

      <div className="card w-full max-w-sm text-left mt-4">
        <h3 className="text-sm font-semibold mb-2">What you get with Premium</h3>
        <ul className="text-sm flex flex-col gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <li>Unlimited score history and progress charts</li>
          <li>AI photo scoring and voice scoring</li>
          <li>Equipment setup management with cloud sync</li>
          <li>Classification and PB tracking</li>
          <li>Multiple club memberships</li>
          <li>Score sharing to social media</li>
        </ul>
      </div>
    </div>
  );
}
