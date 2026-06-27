"use client";

export default function Pagination({ page, totalPages, onPageChange, pageSize, onPageSizeChange, pageSizes = [10, 25, 50], className = "" }) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  if (start > 1) pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (end < totalPages) pages.push(totalPages);

  const btnBase = "flex items-center justify-center min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg border cursor-pointer transition-colors";

  return (
    <div className={`flex items-center justify-between gap-4 flex-wrap ${className}`}>
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Show</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="text-sm py-1 px-2 rounded-md border cursor-pointer"
            style={{ background: "var(--surface-1)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            aria-label="Items per page"
          >
            {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={btnBase}
            style={{
              background: "transparent",
              borderColor: "var(--border)",
              color: page <= 1 ? "var(--text-tertiary)" : "var(--text-primary)",
              opacity: page <= 1 ? 0.4 : 1,
              cursor: page <= 1 ? "not-allowed" : "pointer",
            }}
            aria-label="Previous page"
          >
            ‹
          </button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm" style={{ color: "var(--text-tertiary)" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={btnBase}
                style={{
                  background: p === page ? "var(--accent)" : "transparent",
                  borderColor: p === page ? "var(--accent)" : "var(--border)",
                  color: p === page ? "var(--accent-foreground)" : "var(--text-primary)",
                  fontWeight: p === page ? 600 : 400,
                }}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={btnBase}
            style={{
              background: "transparent",
              borderColor: "var(--border)",
              color: page >= totalPages ? "var(--text-tertiary)" : "var(--text-primary)",
              opacity: page >= totalPages ? 0.4 : 1,
              cursor: page >= totalPages ? "not-allowed" : "pointer",
            }}
            aria-label="Next page"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}
