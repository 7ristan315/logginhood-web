import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ThemeProvider from "@/components/ThemeProvider";

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
        <ThemeProvider>
          <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-accent bg-background/90 px-6 py-3 backdrop-blur">
            <Link href="/" className="text-lg font-bold tracking-tight text-accent">
              🏹 Logginhood
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/clubs" className="hover:text-accent">Clubs</Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="hover:text-accent">Dashboard</Link>
                  <Link href="/history" className="hover:text-accent">History</Link>
                  <Link href="/progress" className="hover:text-accent">Progress</Link>
                  <Link href="/profile" className="hover:text-accent">Profile</Link>
                  <Link href="/settings" className="hover:text-accent">Settings</Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="underline hover:text-accent">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-accent">Log in</Link>
                  <Link href="/signup" className="btn-primary">Sign up</Link>
                </>
              )}
            </nav>
          </header>
          <div className="flex-1">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
