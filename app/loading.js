export default function Loading() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-8">
      <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "var(--surface-3)" }} />
      <div className="h-4 w-72 rounded-md animate-pulse" style={{ background: "var(--surface-3)", opacity: 0.6 }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card flex flex-col gap-2">
            <div className="h-3 w-16 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            <div className="h-7 w-20 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
          </div>
        ))}
      </div>
      <div className="card mt-2" style={{ height: 200 }}>
        <div className="h-full w-full rounded-lg animate-pulse" style={{ background: "var(--surface-3)", opacity: 0.4 }} />
      </div>
      <div className="card" style={{ height: 160 }}>
        <div className="h-full w-full rounded-lg animate-pulse" style={{ background: "var(--surface-3)", opacity: 0.3 }} />
      </div>
    </main>
  );
}
