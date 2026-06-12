const VARIANTS = {
  default: "bg-accent-light text-accent",
  success: "bg-green-500/15 text-green-600",
  warning: "bg-amber-500/15 text-amber-600",
  danger: "bg-red-500/15 text-red-600",
  info: "bg-blue-500/15 text-blue-600",
  neutral: "bg-gray-500/15 text-gray-500",
};

export default function Badge({ variant = "default", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${VARIANTS[variant] ?? VARIANTS.default} ${className}`}
    >
      {children}
    </span>
  );
}
