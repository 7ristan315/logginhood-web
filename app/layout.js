import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ThemeProvider from "@/components/ThemeProvider";
import SidebarNav from "@/components/SidebarNav";
import { getMessages } from "@/lib/i18n";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Logginhood",
  description: "The hub for archers, clubs, and scores.",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const messages = getMessages();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, bow_type, platform_admin, clubs(id, name)")
      .eq("id", user.id)
      .single();
    // Fall back to auth metadata for name if profile not yet populated
    profile = {
      ...data,
      full_name: data?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || null,
    };
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=JSON.parse(localStorage.getItem("logginhood_theme"));document.documentElement.classList.add(t&&t.mode==="dark"?"dark":"light");}catch(e){document.documentElement.classList.add("light");}})();`,
        }} />
      </head>
      <body className="h-full flex overflow-hidden">
        <ThemeProvider>
          <a href="#main-content" className="skip-to-main">Skip to main content</a>
          <SidebarNav messages={messages} user={user} profile={profile} />
          <div id="main-content" className="flex-1 min-w-0 overflow-y-auto main-content" role="main">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
