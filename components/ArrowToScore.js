"use client";
import { useEffect, useRef } from "react";

const SCORES = ["X", "X", "10", "10", "10", "9", "9", "8", "7", "M"];

function randomArrow(w, h) {
  return {
    phase: "fall",
    x: 20 + Math.random() * (w - 40),
    y: -30 - Math.random() * 60,
    vy: 0.6 + Math.random() * 1.0,
    len: 18 + Math.random() * 14,
    angle: Math.PI / 2 + (Math.random() - 0.5) * 0.35,
    alpha: 0.5 + Math.random() * 0.4,
    score: SCORES[Math.floor(Math.random() * SCORES.length)],
    impactT: 0,
    scoreY: 0,
    scoreAlpha: 0,
    floor: h * (0.55 + Math.random() * 0.35),
  };
}

export default function ArrowToScore({ style }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let raf;

    function getAccent() {
      return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2f6f4f";
    }

    function init() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 18 }, () => {
        const p = randomArrow(canvas.width, canvas.height);
        p.y = Math.random() * canvas.height;
        return p;
      });
    }

    function drawArrow(p) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = getAccent();
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      const l = p.len;
      ctx.beginPath();
      ctx.moveTo(0, -l / 2);
      ctx.lineTo(0, l / 2);
      ctx.stroke();
      // fletching at tail
      ctx.beginPath();
      ctx.moveTo(0, l / 2);
      ctx.lineTo(-3.5, l / 2 - 7);
      ctx.moveTo(0, l / 2);
      ctx.lineTo(3.5, l / 2 - 7);
      ctx.stroke();
      // point at tip
      ctx.beginPath();
      ctx.moveTo(0, -l / 2);
      ctx.lineTo(-2.5, -l / 2 + 6);
      ctx.moveTo(0, -l / 2);
      ctx.lineTo(2.5, -l / 2 + 6);
      ctx.stroke();
      ctx.restore();
    }

    function drawImpact(p) {
      const t = p.impactT / 12;
      ctx.save();
      ctx.globalAlpha = (1 - t) * 0.6;
      ctx.strokeStyle = p.score === "M" ? "rgba(200,80,80,0.8)" : getAccent();
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const r = t * 14;
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(a) * 2, p.floor + Math.sin(a) * 2);
        ctx.lineTo(p.x + Math.cos(a) * r, p.floor + Math.sin(a) * r);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawScore(p) {
      ctx.save();
      ctx.globalAlpha = p.scoreAlpha;
      ctx.fillStyle = p.score === "M" ? "rgba(200,80,80,0.9)" : getAccent();
      ctx.font = `bold 13px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(p.score, p.x, p.scoreY);
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        if (p.phase === "fall") {
          p.y += p.vy;
          drawArrow(p);
          if (p.y >= p.floor) {
            p.phase = "impact";
            p.impactT = 0;
            p.scoreY = p.floor;
            p.scoreAlpha = 0;
          }
        } else if (p.phase === "impact") {
          drawImpact(p);
          p.impactT++;
          if (p.impactT >= 12) {
            p.phase = "score";
            p.scoreAlpha = 1;
          }
        } else if (p.phase === "score") {
          p.scoreY -= 0.55;
          p.scoreAlpha -= 0.018;
          drawScore(p);
          if (p.scoreAlpha <= 0) {
            particles[idx] = randomArrow(canvas.width, canvas.height);
          }
        }
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
