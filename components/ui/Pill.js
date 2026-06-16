export default function Pill({ active = false, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer ${className}`}
      style={
        active
          ? {
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              border: "1.5px solid var(--accent)",
            }
          : {
              background: "transparent",
              color: "var(--foreground)",
              border: "1.5px solid var(--accent)",
            }
      }
    >
      {children}
    </button>
  );
}
