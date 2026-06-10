import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Logginhood",
  description: "The hub for archers, clubs, and scores.",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <Link href="/" className="font-semibold">
            Logginhood
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/clubs">Clubs</Link>
            {user ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="underline">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/signup">Sign up</Link>
              </>
            )}
          </nav>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
