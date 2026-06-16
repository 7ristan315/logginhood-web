"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translate } from "@/lib/i18n";

const ITEMS = [
  { href: "/dashboard", icon: "📊", key: "nav.dashboard" },
  { href: "/history", icon: "📜", key: "nav.history" },
  { href: "/progress", icon: "📈", key: "nav.progress" },
  { href: "/profile", icon: "👤", key: "nav.profile" },
  { href: "/my-club", icon: "🏹", key: "nav.myClub" },
  { href: "/world-rankings", icon: "🌍", key: "nav.worldRankings" },
];

export default function SidebarNav({ messages }) {
  const pathname = usePathname();
  const t = (key) => translate(messages, key);

  return (
    <nav className="flex w-16 md:w-56 shrink-0 flex-col gap-1 border-r border-accent-light px-2 py-4">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-accent-light font-semibold text-foreground border-l-2 border-accent"
                : "border-l-2 border-transparent hover:bg-accent-light hover:text-foreground"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="hidden md:inline">{t(item.key)}</span>
          </Link>
        );
      })}
      <div className="mt-2 border-t border-accent-light pt-2 flex flex-col gap-1">
        <a
          href="https://logginhood.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 md:justify-start"
        >
          <span aria-hidden="true">🎯</span>
          <span className="hidden md:inline">{t("nav.scoreRound")}</span>
        </a>
        {(() => {
          const active = pathname === "/clubs" || pathname.startsWith("/clubs/");
          return (
            <Link
              href="/clubs"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-light font-semibold text-foreground border-l-2 border-accent"
                  : "border-l-2 border-transparent hover:bg-accent-light hover:text-foreground"
              }`}
            >
              <span aria-hidden="true">🏛️</span>
              <span className="hidden md:inline">{t("nav.clubs")}</span>
            </Link>
          );
        })()}
      </div>
    </nav>
  );
}
