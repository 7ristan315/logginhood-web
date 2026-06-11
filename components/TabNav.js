"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["/dashboard", "Dashboard"],
  ["/profile", "Profile"],
  ["/history", "History"],
  ["/progress", "Progress"],
  ["/settings", "Settings"],
];

export default function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="tab-nav">
      {TABS.map(([href, label]) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} className={active ? "active" : ""}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
