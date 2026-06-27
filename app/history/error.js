"use client";

export default function Error({ error, reset }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 p-4 md:p-8 text-center" style={{ paddingTop: "10vh" }}>
      <div className="text-4xl">⚠️</div>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {error?.message || "Please try again."}
      </p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </main>
  );
}
