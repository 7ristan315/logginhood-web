"use client";

import { useState } from "react";
import { confirmConsent } from "./actions";

export default function ParentalConsentClient({ token, profileId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const missing = !token || !profileId;

  async function approve() {
    setLoading(true);
    setResult(null);
    const res = await confirmConsent({ token, profileId });
    setResult(res);
    setLoading(false);
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-bold">{result.already ? "Already approved" : "Consent recorded"}</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {result.name ? `${result.name}'s` : "The"} account can now be made public on Logginhood.
          They control whether to actually show their profile and can turn it off again at any time.
        </p>
        <a href="/" className="btn-primary mt-2">Done</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <span className="text-5xl">🛡️</span>
      <div>
        <h2 className="text-xl font-bold">Parental consent</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          An under-18 archer has asked to make their Logginhood profile public. As their parent or
          guardian, please review what this allows before approving.
        </p>
      </div>

      <div className="card flex flex-col gap-2 w-full max-w-sm text-left text-sm">
        <p className="font-semibold">Approving this allows their account to optionally show:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1" style={{ color: "var(--text-secondary)" }}>
          <li>Their name and archery profile on the public website</li>
          <li>Their scores on public leaderboards and club listings</li>
          <li>Links to any social media accounts they add</li>
        </ul>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Nothing is shown automatically — after consent, the archer still chooses whether to switch
          public visibility on, and either of you can turn it off again at any time.
        </p>
      </div>

      {missing && (
        <p className="text-sm" style={{ color: "var(--danger, #b00)" }}>
          This consent link is incomplete. Please open the link exactly as it appears in the email.
        </p>
      )}
      {result?.error && (
        <p className="text-sm" style={{ color: "var(--danger, #b00)" }}>{result.error}</p>
      )}

      <div className="flex gap-3">
        <button className="btn-primary" onClick={approve} disabled={loading || missing}>
          {loading ? "Approving…" : "I approve"}
        </button>
        <a href="/" className="btn-secondary">Cancel</a>
      </div>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        If you don't recognise this request, simply close this page — nothing will change and the
        account stays private.
      </p>
    </div>
  );
}
