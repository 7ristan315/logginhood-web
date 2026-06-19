"use client";
import { useEffect, useRef } from "react";

export default function ScoreMatrix({ style }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const scores = ["X", "10", "9", "8", "7", "M", "M", "M"];
    let drops = [];
    let raf;

    function init() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const cols = Math.floor(canvas.width / 20);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
    }

    function tick() {
      ctx.fillStyle = "rgba(10,10,10,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "12px monospace";
      drops.forEach((y, i) => {
        const s = scores[Math.floor(Math.random() * scores.length)];
        const isMiss = s === "M";
        ctx.fillStyle = isMiss
          ? "rgba(232,57,74,0.65)"
          : s === "X"
          ? "rgba(243,211,78,0.9)"
          : `rgba(${80 + Math.floor(Math.random() * 30)},200,${100 + Math.floor(Math.random() * 60)},0.65)`;
        ctx.fillText(s, i * 20 + 4, y * 15);
        drops[i] = y > canvas.height / 15 + 5 && Math.random() > 0.975 ? 0 : y + 0.55;
      });
      raf = requestAnimationFrame(tick);
    }

    init();
    tick();

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
    />
  );
}
