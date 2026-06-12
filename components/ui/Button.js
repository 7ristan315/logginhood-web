import Link from "next/link";
import Spinner from "./Spinner";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

const VARIANTS = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border border-accent text-accent hover:bg-accent-light",
  ghost: "text-foreground hover:bg-accent-light",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZES = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const classes = `${BASE} ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || loading} {...props}>
        {loading && <Spinner size="sm" />}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
