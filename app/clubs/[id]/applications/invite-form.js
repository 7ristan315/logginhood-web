"use client";

import { useActionState, useState } from "react";
import { sendInvite } from "./actions";

export default function InviteForm({ clubId, inviteLink }) {
  const [state, formAction, pending] = useActionState(sendInvite, null);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium mb-1">Invite link</p>
        <div className="flex items-center gap-2">
          <input readOnly value={inviteLink} className="input-field text-sm" onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copyLink} className="btn-secondary text-sm whitespace-nowrap">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs opacity-60 mt-1">
          Anyone who signs up using this link automatically applies to join this club.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="clubId" value={clubId} />
        <p className="text-sm font-medium">Email an invite</p>
        <div className="flex items-center gap-2">
          <input type="email" name="email" required placeholder="archer@example.com" className="input-field text-sm" />
          <button type="submit" disabled={pending} className="btn-primary text-sm whitespace-nowrap disabled:opacity-50">
            {pending ? "Sending…" : "Send invite"}
          </button>
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
      </form>
    </div>
  );
}
