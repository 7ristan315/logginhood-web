"use client";

import { useState } from "react";
import { vote, unvote } from "./actions";

function VoteBar({ count, maxCount }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div style={{ height: 4, borderRadius: 2, background: "var(--accent-light)", overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.4s ease" }} />
    </div>
  );
}

export default function LogoGallery({ logos, voteCounts, userVotes, isLoggedIn }) {
  const [lightbox, setLightbox] = useState(null);
  const maxVotes = Math.max(1, ...Object.values(voteCounts));

  const sorted = [...logos].sort((a, b) => (voteCounts[b] || 0) - (voteCounts[a] || 0));

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}>
        {sorted.map((filename, i) => {
          const count = voteCounts[filename] || 0;
          const hasVoted = userVotes.has(filename);
          const rank = i + 1;
          const isLeader = rank === 1 && count > 0;

          return (
            <div key={filename} style={{
              borderRadius: 14,
              overflow: "hidden",
              border: isLeader ? "2px solid var(--accent)" : "1px solid var(--accent-light)",
              background: "color-mix(in srgb, var(--accent) 3%, var(--background))",
              display: "flex",
              flexDirection: "column",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: isLeader ? "0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)" : "none",
            }}>
              {/* Vote count header */}
              <div style={{
                padding: "8px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--accent-light)",
                background: isLeader ? "color-mix(in srgb, var(--accent) 8%, var(--background))" : "transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isLeader && <span style={{ fontSize: 16 }}>👑</span>}
                  <span style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}>
                    {count}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 500 }}>
                    vote{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: 0.4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  #{rank}
                </span>
              </div>

              {/* Image */}
              <div
                onClick={() => setLightbox(filename)}
                style={{
                  cursor: "pointer",
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 220,
                  background: "color-mix(in srgb, var(--accent) 2%, var(--background))",
                }}
              >
                <img
                  src={`/logos/${filename}`}
                  alt={`Logo concept ${rank}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 240,
                    objectFit: "contain",
                    borderRadius: 8,
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                />
              </div>

              {/* Vote bar + button */}
              <div style={{ padding: "10px 14px 14px" }}>
                <VoteBar count={count} maxCount={maxVotes} />
                <div style={{ marginTop: 10 }}>
                  {!isLoggedIn ? (
                    <span style={{ fontSize: 12, opacity: 0.4 }}>Log in to vote</span>
                  ) : hasVoted ? (
                    <form action={unvote}>
                      <input type="hidden" name="filename" value={filename} />
                      <button type="submit" style={{
                        width: "100%",
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "1.5px solid var(--accent)",
                        background: "var(--accent)",
                        color: "var(--accent-foreground)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "opacity 0.15s",
                      }}>
                        ✓ Voted — tap to remove
                      </button>
                    </form>
                  ) : (
                    <form action={vote}>
                      <input type="hidden" name="filename" value={filename} />
                      <button type="submit" style={{
                        width: "100%",
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "1.5px solid var(--accent)",
                        background: "transparent",
                        color: "var(--accent)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.target.style.background = "var(--accent)"; e.target.style.color = "var(--accent-foreground)"; }}
                        onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "var(--accent)"; }}
                      >
                        🏹 Vote for this logo
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            padding: "2rem",
          }}
        >
          <img
            src={`/logos/${lightbox}`}
            alt="Logo full size"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              fontSize: 22,
              width: 40,
              height: 40,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
