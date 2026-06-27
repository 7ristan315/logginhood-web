"use client";

import { useState, useRef } from "react";

export default function Tooltip({ content, children, position = "top", className = "" }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  function show() {
    clearTimeout(timeoutRef.current);
    setVisible(true);
  }

  function hide() {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <span
          className={`absolute ${positions[position]} z-50 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none`}
          style={{
            background: "var(--text-primary)",
            color: "var(--text-inverted)",
            boxShadow: "var(--shadow-md)",
            animation: "tooltip-in 0.15s ease",
          }}
          role="tooltip"
        >
          {content}
        </span>
      )}
      {visible && <style>{`@keyframes tooltip-in { from { opacity: 0; transform: translateY(${position === "top" ? "4px" : position === "bottom" ? "-4px" : "0"}) translateX(${position === "left" ? "4px" : position === "right" ? "-4px" : "-50%"}); } }`}</style>}
    </span>
  );
}
