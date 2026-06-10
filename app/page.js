import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">Logginhood</h1>
      <p className="text-lg text-gray-600">
        The hub for archers, clubs, and scores. Track your progress, join a
        club, and compare results with archers around the world.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/signup" className="rounded bg-black px-4 py-2 text-white">
          Get started
        </Link>
        <Link href="/clubs" className="rounded border px-4 py-2">
          Browse clubs
        </Link>
      </div>
    </main>
  );
}
