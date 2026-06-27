export default function Loading() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-8">
      <div className="h-7 w-44 rounded-lg animate-pulse" style={{ background: "var(--surface-3)" }} />
      <div className="h-3.5 w-64 rounded-md animate-pulse" style={{ background: "var(--surface-3)", opacity: 0.5 }} />
      <div className="card mt-2" style={{ height: 180 }}>
        <div className="h-full w-full rounded-lg animate-pulse" style={{ background: "var(--surface-3)", opacity: 0.3 }} />
      </div>
      <div className="card" style={{ height: 120 }}>
        <div className="h-full w-full rounded-lg animate-pulse" style={{ background: "var(--surface-3)", opacity: 0.25 }} />
      </div>
    </main>
  );
}
