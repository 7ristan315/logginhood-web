"use client";

import { useEffect, useRef, useState } from "react";
import { SOCIAL_PLATFORMS } from "@/lib/social";

const CANVAS_SIZE = 1080;
const EMOJIS = ["🔥", "🎯", "🏆", "💪", "😄", "🥳", "⭐", "🎉"];
const SITE_URL = "https://logginhood.com";

function overlayLines(type, score, max, pct, pbDiff) {
  const classification = score.classification && score.classification !== "—" ? score.classification : null;

  if (type === "pb" && pbDiff != null && pbDiff > 0) {
    return [
      "New personal best!",
      `+${pbDiff} on my previous best`,
      `${score.round_name}: ${score.score}${max ? ` / ${max}` : ""}`,
      classification,
    ].filter(Boolean);
  }

  if (type === "full") {
    return [
      score.round_name,
      `${score.score}${max ? ` / ${max}` : ""}`,
      pct != null ? `${pct}%` : null,
      classification,
      score.golds != null ? `${score.golds} golds` : null,
    ].filter(Boolean);
  }

  return [
    score.round_name,
    `${score.score}${max ? ` / ${max}` : ""}`,
    classification,
  ].filter(Boolean);
}

function captionText(type, score, max, pct, pbDiff) {
  const lines = overlayLines(type, score, max, pct, pbDiff);
  return `${lines.join(" · ")}\n\n🏹 Shared from ${SITE_URL}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function ShareComposer({ score, max, pct, pbDiff, socialLinks }) {
  const canvasRef = useRef(null);
  const photoRef = useRef(null);
  const logoRef = useRef(null);
  const dragRef = useRef(null);

  const hasPb = pbDiff != null && pbDiff > 0;
  const [overlayType, setOverlayType] = useState(hasPb ? "pb" : "final");
  const [overlayPos, setOverlayPos] = useState({ x: 0.5, y: 0.5 });
  const [stickers, setStickers] = useState([]);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const linkedPlatforms = SOCIAL_PLATFORMS.filter((p) => socialLinks?.[p.key]);

  useEffect(() => {
    const logo = new Image();
    logo.src = "/brand/logo-mark.png";
    logo.onload = () => {
      logoRef.current = logo;
      draw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayType, overlayPos, stickers, hasPhoto]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (photoRef.current) {
      const img = photoRef.current;
      const scale = Math.max(W / img.width, H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    } else {
      ctx.fillStyle = "#e8f3ed";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2f6f4f";
      ctx.font = "500 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add a photo to get started", W / 2, H / 2);
    }

    // Overlay card
    const lines = overlayLines(overlayType, score, max, pct, pbDiff);
    const cardW = 720;
    const lineH = 64;
    const cardH = 56 + lines.length * lineH;
    const cardX = overlayPos.x * W - cardW / 2;
    const cardY = overlayPos.y * H - cardH / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    lines.forEach((line, i) => {
      ctx.font = i === 0 ? "500 48px sans-serif" : "400 36px sans-serif";
      ctx.fillText(line, cardX + cardW / 2, cardY + 56 + i * lineH);
    });

    // Stickers
    stickers.forEach((st) => {
      ctx.font = "80px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(st.emoji, st.x * W, st.y * H);
    });

    // Bottom watermark
    const barH = 84;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(0, H - barH, W, barH);
    if (logoRef.current) {
      ctx.drawImage(logoRef.current, 24, H - barH + 12, 60, 60);
    }
    ctx.fillStyle = "#2f6f4f";
    ctx.font = "500 32px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("logginhood.com", 100, H - barH / 2 + 11);
  }

  function loadFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      photoRef.current = img;
      setHasPhoto(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function canvasPoint(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y };
  }

  function handlePointerDown(e) {
    const { x, y } = canvasPoint(e);

    for (let i = stickers.length - 1; i >= 0; i--) {
      const st = stickers[i];
      if (Math.abs(st.x - x) < 0.06 && Math.abs(st.y - y) < 0.06) {
        dragRef.current = { type: "sticker", index: i };
        return;
      }
    }

    const cardW = 720 / CANVAS_SIZE;
    const lines = overlayLines(overlayType, score, max, pct, pbDiff);
    const cardH = (56 + lines.length * 64) / CANVAS_SIZE;
    if (
      x > overlayPos.x - cardW / 2 &&
      x < overlayPos.x + cardW / 2 &&
      y > overlayPos.y - cardH / 2 &&
      y < overlayPos.y + cardH / 2
    ) {
      dragRef.current = { type: "card" };
    }
  }

  function handlePointerMove(e) {
    if (!dragRef.current) return;
    const { x, y } = canvasPoint(e);
    const cx = Math.min(Math.max(x, 0), 1);
    const cy = Math.min(Math.max(y, 0), 1);

    if (dragRef.current.type === "card") {
      setOverlayPos({ x: cx, y: cy });
    } else if (dragRef.current.type === "sticker") {
      const idx = dragRef.current.index;
      setStickers((prev) => prev.map((st, i) => (i === idx ? { ...st, x: cx, y: cy } : st)));
    }
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function addSticker(emoji) {
    setStickers((prev) => [
      ...prev,
      { emoji, x: 0.25 + 0.1 * (prev.length % 5), y: 0.2 + 0.08 * Math.floor(prev.length / 5) },
    ]);
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "logginhood-score.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    const text = captionText(overlayType, score, max, pct, pbDiff);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], "logginhood-score.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text, title: "My archery score" });
        setShareStatus("Shared!");
      } catch {
        setShareStatus("");
      }
      return;
    }

    downloadImage();
    try {
      await navigator.clipboard?.writeText(text);
      setShareStatus("Image downloaded and caption copied — attach it to your post.");
    } catch {
      setShareStatus("Image downloaded — copy the caption below and attach the image to your post.");
    }
  }

  const text = captionText(overlayType, score, max, pct, pbDiff);

  return (
    <div className="flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full touch-none rounded-lg border"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className="card flex flex-col gap-2">
        <p className="text-sm font-medium">Photo</p>
        <div className="flex gap-2">
          <label className="btn-secondary cursor-pointer text-sm">
            Take photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => loadFile(e.target.files?.[0])}
            />
          </label>
          <label className="btn-secondary cursor-pointer text-sm">
            Choose from gallery
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => loadFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>

      <div className="card flex flex-col gap-2">
        <p className="text-sm font-medium">What to show</p>
        <div className="flex flex-col gap-1 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="overlay" checked={overlayType === "final"} onChange={() => setOverlayType("final")} />
            Final score and classification
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="overlay" checked={overlayType === "full"} onChange={() => setOverlayType("full")} />
            Full round score sheet
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="overlay"
              checked={overlayType === "pb"}
              onChange={() => setOverlayType("pb")}
              disabled={!hasPb}
            />
            {hasPb ? `How much I beat my PB by (+${pbDiff})` : "How much I beat my PB by (no previous PB yet)"}
          </label>
        </div>
        <p className="text-xs opacity-70">Drag the score card on the photo to position it.</p>
      </div>

      <div className="card flex flex-col gap-2">
        <p className="text-sm font-medium">Add stickers</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((emoji) => (
            <button key={emoji} type="button" className="btn-secondary text-lg" onClick={() => addSticker(emoji)}>
              {emoji}
            </button>
          ))}
          {stickers.length > 0 && (
            <button type="button" className="btn-secondary text-sm" onClick={() => setStickers([])}>
              Clear stickers
            </button>
          )}
        </div>
        <p className="text-xs opacity-70">Tap an emoji to add it, then drag it onto your photo.</p>
      </div>

      <div className="card flex flex-col gap-2">
        <p className="text-sm font-medium">Share</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-sm" onClick={handleShare}>
            Share
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={downloadImage}>
            Download image
          </button>
        </div>
        {shareStatus && <p className="text-xs opacity-70">{shareStatus}</p>}

        <p className="mt-2 text-sm font-medium">Caption</p>
        <textarea readOnly value={text} className="input-field h-24 resize-none text-sm" />

        {linkedPlatforms.length > 0 && (
          <>
            <p className="mt-2 text-sm font-medium">Or post directly to</p>
            <div className="flex flex-wrap gap-2">
              {linkedPlatforms.map((p) =>
                p.shareUrl ? (
                  <a
                    key={p.key}
                    href={p.shareUrl(text)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-sm"
                  >
                    {p.icon} {p.label}
                  </a>
                ) : (
                  <a
                    key={p.key}
                    href={socialLinks[p.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-sm"
                  >
                    {p.icon} {p.label}
                  </a>
                )
              )}
            </div>
            <p className="text-xs opacity-70">
              For Instagram, Strava and TikTok, download the image above and attach it when you post.
            </p>
          </>
        )}
        {linkedPlatforms.length === 0 && (
          <p className="text-xs opacity-70">
            Add your social accounts on your{" "}
            <a href="/profile" className="underline hover:text-accent">profile</a> to get quick post links here.
          </p>
        )}
      </div>
    </div>
  );
}
