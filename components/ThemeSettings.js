"use client";

import { useEffect, useState } from "react";
import { ACCENT_PRESETS, applyTheme, loadTheme, saveTheme } from "./ThemeProvider";

export default function ThemeSettings() {
  const [theme, setTheme] = useState({ mode: "light", accent: "#2f6f4f" });

  useEffect(() => {
    setTheme(loadTheme());
  }, []);

  function update(next) {
    setTheme(next);
    saveTheme(next);
    applyTheme(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col gap-3">
        <p className="text-sm font-medium">Display mode</p>
        <div className="grid grid-cols-2 gap-3">
          {["light", "dark"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ ...theme, mode: m })}
              className={theme.mode === m ? "btn-primary" : "btn-secondary"}
            >
              {m === "dark" ? "🌙 Dark mode" : "☀️ Light mode"}
            </button>
          ))}
        </div>
      </div>

      <div className="card flex flex-col gap-3">
        <p className="text-sm font-medium">Accent colour</p>
        <p className="text-xs opacity-70">Used for buttons, links and highlights.</p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.hex}
              type="button"
              title={p.name}
              onClick={() => update({ ...theme, accent: p.hex })}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: p.hex,
                border:
                  theme.accent.toLowerCase() === p.hex.toLowerCase()
                    ? "3px solid var(--foreground)"
                    : "3px solid transparent",
                cursor: "pointer",
              }}
            />
          ))}
          <label
            title="Custom"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                "conic-gradient(red 0deg,#ff0 60deg,#0f0 120deg,#0ff 180deg,#00f 240deg,#f0f 300deg,red 360deg)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 14, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>+</span>
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => update({ ...theme, accent: e.target.value })}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => update({ mode: "light", accent: "#2f6f4f" })}
          className="btn-secondary self-start"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
