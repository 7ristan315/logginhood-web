"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { translate } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import Avatar from "./ui/Avatar";

const BOW_ICON = { Recurve: "🏹", Compound: "⚙️", Barebow: "🎯", Longbow: "🌲" };

const NAV_ITEMS = [
  // Personal
  { href: "/dashboard",       icon: "◈",  key: "nav.dashboard" },
  { href: "/history",         icon: "≡",  key: "nav.history" },
  { href: "/progress",        icon: "∿",  key: "nav.progress" },
  // Community
  { href: "/my-club",         icon: "⌂",  key: "nav.myClub" },
  { href: "/competitions",    icon: "◉",  key: "nav.competitions" },
  // Discover
  { href: "/world-rankings",  icon: "⊕",  key: "nav.worldRankings" },
  { href: "/clubs",           icon: "◎",  label: "Find a Club" },
  { href: "/insights",        icon: "◆",  label: "Insights" },
];

const BOTTOM_BAR_ITEMS = [
  { href: "/dashboard",    icon: "◈", label: "Home" },
  { href: "/history",      icon: "≡", label: "History" },
  { href: "/progress",     icon: "∿", label: "Charts" },
  { href: "/my-club",      icon: "⌂", label: "Club" },
  { href: "/competitions", icon: "◉", label: "Compete" },
];

const MORE_ITEMS = [
  { href: "/world-rankings",  icon: "⊕",  label: "World Rankings" },
  { href: "/clubs",           icon: "◎",  label: "Find a Club" },
  { href: "/insights",        icon: "◆",  label: "Insights" },
  { href: "/my-setup",        icon: "🏹", label: "My Setup" },
  { href: "/import",          icon: "⬆",  label: "Import Scores" },
  { href: "/profile",         icon: "👤", label: "Profile" },
  { href: "/settings",        icon: "⚙",  label: "Settings" },
];

const LOGGED_OUT_ITEMS = [
  { href: "/features",        label: "Features" },
  { href: "/world-rankings",  label: "Rankings" },
  { href: "/clubs",           label: "Clubs" },
  { href: "/login",           label: "Log in" },
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

function BottomBar({ user, profile, pathname, onSignOut }) {
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(href) {
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }

  const moreIsActive = MORE_ITEMS.some(i => isActive(i.href));

  if (!user) {
    return (
      <nav className="mobile-bottom-bar">
        {LOGGED_OUT_ITEMS.map(item => (
          <Link key={item.href} href={item.href}
            className={`mobile-tab ${isActive(item.href) ? "active" : ""}`}>
            <span className="mobile-tab-label">{item.label}</span>
          </Link>
        ))}
        <Link href="/signup" className="mobile-tab active">
          <span className="mobile-tab-label">Sign up</span>
        </Link>
      </nav>
    );
  }

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="mobile-more-backdrop" onClick={() => setMoreOpen(false)}>
          <div className="mobile-more-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--accent-light)" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>More</span>
              <button onClick={() => setMoreOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--foreground)", padding: "4px 8px", lineHeight: 1 }}>✕</button>
            </div>

            {/* Profile link */}
            <Link href="/profile" onClick={() => setMoreOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", textDecoration: "none", color: "var(--foreground)", borderBottom: "1px solid var(--accent-light)" }}>
              <Avatar name={profile?.full_name} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{profile?.full_name || "Archer"}</div>
                {profile?.bow_type && <div style={{ fontSize: 12, opacity: 0.5 }}>{BOW_ICON[profile.bow_type]} {profile.bow_type}</div>}
                {profile?.clubs?.name && <div style={{ fontSize: 11, color: "var(--accent)" }}>{profile.clubs.name}</div>}
              </div>
            </Link>

            {/* Menu items */}
            <div style={{ padding: "8px 0" }}>
              {MORE_ITEMS.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 16px", textDecoration: "none",
                    color: isActive(item.href) ? "var(--accent)" : "var(--foreground)",
                    fontWeight: isActive(item.href) ? 600 : 400,
                    fontSize: 14,
                    background: isActive(item.href) ? "var(--accent-light)" : "transparent",
                  }}>
                  <span style={{ width: 24, textAlign: "center", fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {profile?.platform_admin && (
                <Link href="/admin/clubs" onClick={() => setMoreOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", textDecoration: "none", color: "var(--foreground)", fontSize: 14 }}>
                  <span style={{ width: 24, textAlign: "center", fontSize: 16 }}>⚡</span>
                  Admin
                </Link>
              )}
            </div>

            {/* Score a round CTA */}
            <div style={{ padding: "8px 16px", borderTop: "1px solid var(--accent-light)" }}>
              <a href="https://logginhood.vercel.app" target="_blank" rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 16px", borderRadius: 10, background: "var(--accent)",
                  color: "var(--accent-foreground)", textDecoration: "none", fontWeight: 600, fontSize: 14,
                }}>
                🎯 Score a round
              </a>
            </div>

            {/* Sign out */}
            <div style={{ padding: "4px 16px 12px" }}>
              <button onClick={() => { setMoreOpen(false); onSignOut(); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--foreground)", opacity: 0.4, padding: "8px 0" }}>
                ↩ Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="mobile-bottom-bar">
        {BOTTOM_BAR_ITEMS.map(item => (
          <Link key={item.href} href={item.href}
            className={`mobile-tab ${isActive(item.href) ? "active" : ""}`}>
            <span className="mobile-tab-icon">{item.icon}</span>
            <span className="mobile-tab-label">{item.label}</span>
          </Link>
        ))}
        <button onClick={() => setMoreOpen(true)}
          className={`mobile-tab ${moreIsActive ? "active" : ""}`}>
          <span className="mobile-tab-icon">•••</span>
          <span className="mobile-tab-label">More</span>
        </button>
      </nav>
    </>
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

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <nav className="sidebar-shell sidebar-desktop">
        {!user ? (
          <>
            <div className="sidebar-logo">
              <Image className="logo-light" src="/brand/logo-header-light.png" alt="Logginhood" width={150} height={150} priority />
              <Image className="logo-dark" src="/brand/logo-header-dark.png" alt="Logginhood" width={150} height={150} priority />
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
          </>
        ) : (
          <>
            <div className="sidebar-logo">
              <Link href="/dashboard">
                <Image className="logo-light" src="/brand/logo-header-light.png" alt="Logginhood" width={132} height={132} priority />
                <Image className="logo-dark" src="/brand/logo-header-dark.png" alt="Logginhood" width={132} height={132} priority />
              </Link>
            </div>
            <div style={{ padding: "0 0.5rem" }}>
              <Link href="/profile" className="sidebar-profile">
                <Avatar name={profile?.full_name} size="md" />
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
            <div className="sidebar-nav-items">
              {NAV_ITEMS.map(item => (
                <Link key={item.href} href={item.href}
                  className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}>
                  <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-item-label">{item.label || t(item.key)}</span>
                </Link>
              ))}
              <a href="https://logginhood.vercel.app" target="_blank" rel="noreferrer"
                className="sidebar-cta">
                <span aria-hidden="true">🎯</span>
                <span className="sidebar-item-label">{t("nav.scoreRound")}</span>
              </a>
            </div>
            <div className="sidebar-bottom">
              {profile?.platform_admin && (
                <Link href="/admin/clubs" className={`sidebar-item ${isActive("/admin") ? "active" : ""}`}>
                  <span className="sidebar-item-icon">⚡</span>
                  <span className="sidebar-item-label">Admin</span>
                </Link>
              )}
              <Link href="/my-setup" className={`sidebar-item ${isActive("/my-setup") ? "active" : ""}`}>
                <span className="sidebar-item-icon">🏹</span>
                <span className="sidebar-item-label">My Setup</span>
              </Link>
              <Link href="/import" className={`sidebar-item ${isActive("/import") ? "active" : ""}`}>
                <span className="sidebar-item-icon">⬆</span>
                <span className="sidebar-item-label">Import scores</span>
              </Link>
              <Link href="/settings" className={`sidebar-item ${isActive("/settings") ? "active" : ""}`}>
                <span className="sidebar-item-icon">⚙</span>
                <span className="sidebar-item-label">{t("nav.settings")}</span>
              </Link>
              <button onClick={signOut} className="sidebar-item sidebar-signout">
                <span className="sidebar-item-icon">↩</span>
                <span className="sidebar-item-label">{t("nav.logOut")}</span>
              </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile bottom bar — hidden on desktop */}
      <BottomBar user={user} profile={profile} pathname={pathname} onSignOut={signOut} />
    </>
  );
}
