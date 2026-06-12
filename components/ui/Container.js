const SIZES = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
};

export default function Container({ size = "md", className = "", children }) {
  return (
    <main className={`mx-auto flex w-full flex-col gap-6 p-6 md:p-8 ${SIZES[size] ?? SIZES.md} ${className}`}>
      {children}
    </main>
  );
}
