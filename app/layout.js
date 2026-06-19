import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ThemeProvider from "@/components/ThemeProvider";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui";
import { getMessages, translate } from "@/lib/i18n";
import ScoreMatrix from "@/components/ScoreMatrix";
import ArrowRain from "@/components/ArrowRain";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem("logginhood_theme"));var dark=t&&t.mode==="dark";document.documentElement.classList.add(dark?"dark":"light");}catch(e){document.documentElement.classList.add("light");}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-accent bg-background/90 px-6 py-3 backdrop-blur" style={{position:"sticky",overflow:"hidden"}}><ScoreMatrix />
            <Link href="/" className="flex items-center" style={{position:"relative",zIndex:1}}>
              <Image src="/brand/logo-header.png" alt="Logginhood" width={97} height={40} priority />
            </Link>
            <nav className="flex items-center gap-4 text-sm" style={{position:"relative",zIndex:1,background:"var(--background)",opacity:1,borderRadius:8,padding:"4px 12px",border:"1px solid rgba(128,128,128,0.15)"}}>
              {user ? (
                <>
                  {isPlatformAdmin && (
                    <Link href="/admin/clubs" className="hover:text-accent">{t("nav.admin")}</Link>
                  )}
                  <Link href="/features" className="hover:text-accent">Features</Link>
                  <Link href="/settings" className="hover:text-accent">{t("nav.settings")}</Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="underline hover:text-accent">
                      {t("nav.logOut")}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/features" className="hover:text-accent">Features</Link>
                  <Link href="/clubs" className="hover:text-accent">{t("nav.clubs")}</Link>
                  <Link href="/login" className="hover:text-accent">{t("nav.logIn")}</Link>
                  <Button href="/signup" size="sm">{t("nav.signUp")}</Button>
                </>
              )}
            </nav>
          </header>
          <div className="flex flex-1 min-h-0" style={{position:"relative"}}>
            <ArrowRain />
            {user && <SidebarNav messages={messages} />}
            <div className="min-w-0 flex-1" style={{position:"relative",zIndex:1}}>{children}</div>
          </div>
          <footer style={{position:"relative",overflow:"hidden",padding:"1.5rem 1.5rem",borderTop:"2px solid var(--color-accent)",background:"var(--color-background)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
            <ScoreMatrix />
            <span style={{position:"relative",zIndex:1,fontSize:13,color:"var(--foreground)",opacity:0.5}}>© {new Date().getFullYear()} Logginhood</span>
            <nav style={{position:"relative",zIndex:1,display:"flex",gap:"1.25rem",fontSize:13,opacity:0.7}}>
              <Link href="/features" style={{color:"inherit"}}>Features</Link>
              <Link href="/clubs" style={{color:"inherit"}}>Clubs</Link>
              <Link href="/login" style={{color:"inherit"}}>Log in</Link>
            </nav>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
