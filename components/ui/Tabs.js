"use client";

import Link from "next/link";

export function Tabs({ tabs = [] }) {
  return (
    <nav role="tablist" aria-label="Page tabs" className="tab-nav">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          role="tab"
          aria-selected={tab.active ?? false}
          className={tab.active ? "active" : ""}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

import { useRef } from "react";

export function TabsClient({ tabs = [], value, onChange }) {
  const listRef = useRef(null);

  function handleKeyDown(e, index) {
    const items = listRef.current?.querySelectorAll("[role='tab']");
    if (!items) return;
    let next = null;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      items[next].focus();
      onChange?.(tabs[next].value);
    }
  }

  return (
    <nav ref={listRef} role="tablist" aria-label="Tabs" className="tab-nav">
      {tabs.map((tab, i) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={isActive ? "active" : ""}
            onClick={() => onChange?.(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export default Tabs;
