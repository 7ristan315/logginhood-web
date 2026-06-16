"use client";

import Skeleton from "./Skeleton";

const SORT_NONE = null;
const SORT_ASC = "asc";
const SORT_DESC = "desc";

function SortIcon({ dir }) {
  if (!dir) {
    return (
      <span aria-hidden="true" style={{ opacity: 0.35, marginLeft: 4, fontSize: 10 }}>⇅</span>
    );
  }
  return (
    <span aria-hidden="true" style={{ marginLeft: 4, fontSize: 10 }}>
      {dir === SORT_ASC ? "↑" : "↓"}
    </span>
  );
}

export default function Table({
  columns = [],
  rows = [],
  keyField = "id",
  onSort,
  sortKey,
  sortDir,
  loading = false,
  emptyState = "No data.",
  caption,
  stickyHeader = false,
  striped = true,
  className = "",
}) {
  function handleSortClick(col) {
    if (!col.sortable || !onSort) return;
    let nextDir;
    if (sortKey !== col.key) nextDir = SORT_ASC;
    else if (sortDir === SORT_ASC) nextDir = SORT_DESC;
    else nextDir = SORT_ASC;
    onSort(col.key, nextDir);
  }

  const theadStyle = stickyHeader
    ? { position: "sticky", top: 0, zIndex: 1 }
    : undefined;

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-accent-light ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <table
        role="grid"
        className="w-full border-collapse text-sm"
        style={{ minWidth: "100%" }}
      >
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead style={theadStyle}>
          <tr
            className="border-b border-accent-light"
            style={{ background: "var(--accent-light, color-mix(in srgb, var(--accent) 15%, var(--background)))", opacity: 1 }}
          >
            {columns.map((col) => {
              const isActive = sortKey === col.key;
              const ariaSort = !col.sortable
                ? undefined
                : isActive && sortDir === SORT_ASC
                ? "ascending"
                : isActive && sortDir === SORT_DESC
                ? "descending"
                : "none";

              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  style={{
                    textAlign: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
                    padding: "10px 16px",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    opacity: 0.6,
                    whiteSpace: "nowrap",
                    background: "transparent",
                  }}
                >
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => handleSortClick(col)}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {col.label}
                      <SortIcon dir={isActive ? sortDir : null} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid var(--accent-light)",
                  background: striped && i % 2 !== 0
                    ? "color-mix(in srgb, var(--accent-light) 10%, transparent)"
                    : "transparent",
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "10px 16px" }}>
                    <Skeleton style={{ height: 14, borderRadius: 4 }} />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: "40px 16px", textAlign: "center", opacity: 0.5 }}
              >
                {emptyState}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row[keyField] ?? i}
                className="transition-colors hover:bg-accent-light/30"
                style={{
                  borderBottom: "1px solid var(--accent-light)",
                  background: striped && i % 2 !== 0
                    ? "color-mix(in srgb, var(--accent-light, var(--accent)) 10%, transparent)"
                    : "transparent",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "10px 16px",
                      textAlign: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
                    }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
