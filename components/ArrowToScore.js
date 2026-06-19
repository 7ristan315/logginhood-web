"use client";
import { useEffect, useRef } from "react";

const SCORES = ["X", "X", "10", "10", "10", "9", "9", "8", "7", "M"];

function randomArrow(w, h, reverse) {
  const ceiling = h * (0.1 + Math.random() * 0.35);
  const floor = h * (0.55 + Math.random() * 0.35);
  return {
    phase: "fall",
    x: 20 + Math.random() * (w - 40),
    y: reverse ? h + 30 + Math.random() * 60 : -30 - Math.random() * 60,
    vy: (0.6 + Math.random() * 1.0) * (reverse ? -1 : 1),
    len: 18 + Math.random() * 14,
    // reverse: point faces up (arrow travels up, point leads); normal: point faces down
    angle: reverse
      ? -Math.PI / 2 + (Math.random() - 0.5) * 0.35
      : Math.PI / 2 + (Math.random() - 0.5) * 0.35,
    alpha: 0.5 + Math.random() * 0.4,
    score: SCORES[Math.floor(Math.random() * SCORES.length)],
    impactT: 0,
    scoreY: 0,
    scoreAlpha: 0,
    wall: reverse ? ceiling : floor,
  };
}

export default function ArrowToScore({ style, reverse = false }) {
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
        const p = randomArrow(canvas.width, canvas.height, reverse);
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
      // fletching — flares outward past the tail end
      ctx.beginPath();
      ctx.moveTo(0, l / 2);
      ctx.lineTo(-5, l / 2 + 9);
      ctx.moveTo(0, l / 2);
      ctx.lineTo(5, l / 2 + 9);
      ctx.stroke();
      // point — narrows to a tip
      ctx.beginPath();
      ctx.moveTo(0, -l / 2);
      ctx.lineTo(-2, -l / 2 + 5);
      ctx.moveTo(0, -l / 2);
      ctx.lineTo(2, -l / 2 + 5);
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
        ctx.moveTo(p.x + Math.cos(a) * 2, p.wall + Math.sin(a) * 2);
        ctx.lineTo(p.x + Math.cos(a) * r, p.wall + Math.sin(a) * r);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawScore(p) {
      ctx.save();
      ctx.globalAlpha = p.scoreAlpha;
      ctx.fillStyle = p.score === "M" ? "rgba(200,80,80,0.9)" : getAccent();
      ctx.font = "bold 13px monospace";
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
          const hit = reverse ? p.y <= p.wall : p.y >= p.wall;
          if (hit) {
            p.phase = "impact";
            p.impactT = 0;
            p.scoreY = p.wall;
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
          // score drifts away from the wall
          p.scoreY += reverse ? -0.55 : 0.55;
          p.scoreAlpha -= 0.018;
          drawScore(p);
          if (p.scoreAlpha <= 0) {
            particles[idx] = randomArrow(canvas.width, canvas.height, reverse);
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
  }, [reverse]);

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
