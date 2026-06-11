import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 bg-accent-light px-8 py-20 text-center">
      <h1 className="text-5xl font-bold text-accent">🏹 Logginhood</h1>
      <p className="max-w-2xl text-lg text-gray-600">
        The hub for archers, clubs, and scores. Track your progress, join a
        club, and compare results with archers around the world.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/signup" className="btn-primary">
          Get started
        </Link>
        <Link href="/clubs" className="btn-secondary">
          Browse clubs
        </Link>
      </div>
    </main>
  );
}
