"use client";

import { useEffect } from "react";

const STORAGE_KEY = "logginhood_theme";
export const ACCENT_PRESETS = [
  { name: "Forest", hex: "#2f6f4f" },
  { name: "Sky blue", hex: "#1a6bbf" },
  { name: "Crimson", hex: "#c62828" },
  { name: "Navy", hex: "#0d2137" },
  { name: "Purple", hex: "#6a1b9a" },
  { name: "Amber", hex: "#e65100" },
  { name: "Teal", hex: "#00695c" },
  { name: "Rose", hex: "#c2185b" },
  { name: "Gold", hex: "#b7860b" },
  { name: "Slate", hex: "#475569" },
];

export function loadTheme() {
  if (typeof window === "undefined") return { mode: "light", accent: "#2f6f4f" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { mode: "light", accent: "#2f6f4f" };
  } catch {
    return { mode: "light", accent: "#2f6f4f" };
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // ignore
  }
}

function hexToRgb(hex) {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const num = parseInt(v, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

function luma(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const dark = theme.mode === "dark";
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  const background = dark ? "#0a0a0a" : "#ffffff";
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-light", mix(theme.accent, background, 0.85));
  root.style.setProperty("--accent-foreground", luma(theme.accent) > 0.45 ? "#111111" : "#ffffff");
}

export default function ThemeProvider({ children }) {
  useEffect(() => {
    applyTheme(loadTheme());
  }, []);

  return children;
}
