const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 };

export default function Avatar({ name, src, size = "md", className = "" }) {
  const px = SIZES[size] || SIZES.md;
  const fontSize = px * 0.38;

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        width={px}
        height={px}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  const parts = (name || "?").trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold ${className}`}
      style={{
        width: px,
        height: px,
        background: "var(--accent)",
        color: "var(--accent-foreground)",
        fontSize,
        letterSpacing: 0.5,
      }}
      role="img"
      aria-label={name || "Avatar"}
    >
      {letters.toUpperCase()}
    </div>
  );
}
