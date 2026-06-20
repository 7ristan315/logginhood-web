"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { translate } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

const BOW_ICON = { Recurve: "🏹", Compound: "⚙️", Barebow: "🎯", Longbow: "🌲" };

const NAV_ITEMS = [
  { href: "/dashboard",       icon: "◈",  key: "nav.dashboard" },
  { href: "/history",         icon: "≡",  key: "nav.history" },
  { href: "/progress",        icon: "∿",  key: "nav.progress" },
  { href: "/my-club",         icon: "⌂",  key: "nav.myClub" },
  { href: "/competitions",    icon: "◉",  key: "nav.competitions" },
  { href: "/world-rankings",  icon: "⊕",  key: "nav.worldRankings" },
  { href: "/clubs",           icon: "◎",  key: "nav.clubs" },
];

const LOGGED_OUT_ITEMS = [
  { href: "/features",  label: "Features" },
  { href: "/clubs",     label: "Clubs" },
  { href: "/login",     label: "Log in" },
];

function Initials({ name }) {
  const parts = (name || "?").trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: "var(--accent)", color: "var(--accent-foreground)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, fontWeight: 700, letterSpacing: 0.5, flexShrink: 0,
    }}>
      {letters.toUpperCase()}
    </div>
  );
}

export default function SidebarNav({ messages, user, profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = (key) => translate(messages, key);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href) {
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }

  if (!user) {
    return (
      <nav className="sidebar-shell">
        <div className="sidebar-logo">
          <Image src="/brand/logo-header.png" alt="Logginhood" width={120} height={50} priority />
        </div>
        <div className="sidebar-nav-items" style={{ marginTop: "2rem" }}>
          {LOGGED_OUT_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}>
              <span className="sidebar-item-label">{item.label}</span>
            </Link>
          ))}
          <Link href="/signup" className="sidebar-cta" style={{ marginTop: "0.5rem" }}>
            Sign up free
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sidebar-shell">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/dashboard">
          <Image src="/brand/logo-header.png" alt="Logginhood" width={110} height={46} priority />
        </Link>
      </div>

      {/* Profile card — below logo */}
      <div style={{ padding: "0 0.5rem" }}>
        <Link href="/profile" className="sidebar-profile">
          <Initials name={profile?.full_name} />
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{profile?.full_name || "Archer"}</span>
            {profile?.bow_type && (
              <span className="sidebar-profile-meta">
                {BOW_ICON[profile.bow_type]} {profile.bow_type}
              </span>
            )}
            {profile?.clubs?.name && (
              <span className="sidebar-profile-club">{profile.clubs.name}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <div className="sidebar-nav-items">
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href}
            className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}>
            <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
            <span className="sidebar-item-label">{t(item.key)}</span>
          </Link>
        ))}

        <a href="https://logginhood.vercel.app" target="_blank" rel="noreferrer"
          className="sidebar-cta">
          <span aria-hidden="true">🎯</span>
          <span className="sidebar-item-label">{t("nav.scoreRound")}</span>
        </a>
      </div>

      {/* Bottom: settings + sign out */}
      <div className="sidebar-bottom">
        {profile?.platform_admin && (
          <Link href="/admin/clubs" className={`sidebar-item ${isActive("/admin") ? "active" : ""}`}>
            <span className="sidebar-item-icon">⚡</span>
            <span className="sidebar-item-label">Admin</span>
          </Link>
        )}
        <Link href="/settings" className={`sidebar-item ${isActive("/settings") ? "active" : ""}`}>
          <span className="sidebar-item-icon">⚙</span>
          <span className="sidebar-item-label">{t("nav.settings")}</span>
        </Link>
        <button onClick={signOut} className="sidebar-item sidebar-signout">
          <span className="sidebar-item-icon">↩</span>
          <span className="sidebar-item-label">{t("nav.logOut")}</span>
        </button>
      </div>
    </nav>
  );
}
