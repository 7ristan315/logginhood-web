import Link from "next/link";

export default function Breadcrumb({ items, className = "" }) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.href || item.label} className="flex items-center gap-1.5">
            {i > 0 && <span style={{ color: "var(--text-tertiary)" }} aria-hidden="true">›</span>}
            {isLast ? (
              <span className="font-medium" style={{ color: "var(--text-primary)" }} aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="font-medium hover:underline"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
