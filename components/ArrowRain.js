"use client";
import { useEffect, useRef } from "react";

export default function ArrowRain({ style }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let arrows = [];
    let raf;

    function init() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      arrows = Array.from({ length: 35 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        speed: 1.2 + Math.random() * 2.2,
        len: 22 + Math.random() * 18,
        angle: Math.PI / 2 + (Math.random() - 0.5) * 0.5,
        alpha: 0.12 + Math.random() * 0.22,
      }));
    }

    function drawArrow(x, y, len, angle, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#f3d34e";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -len / 2);
      ctx.lineTo(0, len / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -len / 2);
      ctx.lineTo(-4, -len / 2 + 8);
      ctx.moveTo(0, -len / 2);
      ctx.lineTo(4, -len / 2 + 8);
      ctx.stroke();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      arrows.forEach((a) => {
        a.y += a.speed;
        if (a.y > canvas.height + 40) {
          a.y = -40;
          a.x = Math.random() * canvas.width;
        }
        drawArrow(a.x, a.y, a.len, a.angle, a.alpha);
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
