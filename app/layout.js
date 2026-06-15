import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ThemeProvider from "@/components/ThemeProvider";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui";
import { getMessages, translate } from "@/lib/i18n";

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

  const messages = getMessages();
  const t = (key) => translate(messages, key);

  let isPlatformAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("platform_admin")
      .eq("id", user.id)
      .single();
    isPlatformAdmin = !!profile?.platform_admin;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-accent bg-background/90 px-6 py-3 backdrop-blur">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-accent">
              <Image src="/brand/logo-icon.png" alt="" width={32} height={32} className="rounded-sm" priority />
              Logginhood
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  {isPlatformAdmin && (
                    <Link href="/admin/clubs" className="hover:text-accent">{t("nav.admin")}</Link>
                  )}
                  <Link href="/settings" className="hover:text-accent">{t("nav.settings")}</Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="underline hover:text-accent">
                      {t("nav.logOut")}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/clubs" className="hover:text-accent">{t("nav.clubs")}</Link>
                  <Link href="/login" className="hover:text-accent">{t("nav.logIn")}</Link>
                  <Button href="/signup" size="sm">{t("nav.signUp")}</Button>
                </>
              )}
            </nav>
          </header>
          <div className="flex flex-1 min-h-0">
            {user && <SidebarNav messages={messages} />}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
