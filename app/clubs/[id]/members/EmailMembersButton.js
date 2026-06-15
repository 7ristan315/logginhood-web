"use client";

export default function EmailMembersButton({ emails, clubName }) {
  if (!emails.length) return null;

  const href = `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${encodeURIComponent(`${clubName} update`)}`;

  return (
    <a href={href} className="btn-secondary text-sm">
      ✉️ Email members
    </a>
  );
}
