"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EquipmentPicker({ category, value, onChange, placeholder }) {
  const [catalog, setCatalog] = useState([]);
  const [brandFilter, setBrandFilter] = useState(value?.brand || "");
  const [modelFilter, setModelFilter] = useState(value?.model || "");
  const [showBrands, setShowBrands] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const supabase = createClient();
  const wrapRef = useRef();

  useEffect(() => {
    supabase.from("equipment_catalog").select("brand, model, metadata")
      .eq("category", category).order("brand").order("model")
      .then(({ data }) => setCatalog(data || []));
  }, [category]);

  useEffect(() => {
    function handleClick(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setShowBrands(false); setShowModels(false); } }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const brands = [...new Set(catalog.map(c => c.brand))].sort();
  const models = catalog
    .filter(c => !brandFilter || c.brand.toLowerCase().includes(brandFilter.toLowerCase()))
    .map(c => ({ brand: c.brand, model: c.model, metadata: c.metadata }));
  const filteredModels = models.filter(m =>
    !modelFilter || m.model.toLowerCase().includes(modelFilter.toLowerCase())
  );

  function selectBrand(b) {
    setBrandFilter(b);
    setShowBrands(false);
    setShowModels(true);
    onChange({ ...value, brand: b });
  }

  function selectModel(m) {
    setModelFilter(m.model);
    setBrandFilter(m.brand);
    setShowModels(false);
    onChange({ ...value, brand: m.brand, model: m.model, ...(m.metadata || {}) });
  }

  const inputStyle = { fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", width: "100%" };
  const dropStyle = { position: "absolute", top: "100%", left: 0, right: 0, maxHeight: 180, overflowY: "auto", background: "var(--background)", border: "1px solid var(--border)", borderRadius: 6, zIndex: 10, marginTop: 2 };
  const itemStyle = { padding: "6px 10px", cursor: "pointer", fontSize: 12, borderBottom: "1px solid var(--border)" };

  return (
    <div ref={wrapRef} style={{ display: "flex", gap: 8 }}>
      <div style={{ flex: 1, position: "relative" }}>
        <label style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, display: "block", marginBottom: 2 }}>Brand</label>
        <input value={brandFilter} onChange={e => { setBrandFilter(e.target.value); onChange({ ...value, brand: e.target.value }); setShowBrands(true); }}
          onFocus={() => setShowBrands(true)} placeholder={placeholder || "Brand"} style={inputStyle} />
        {showBrands && brands.filter(b => !brandFilter || b.toLowerCase().includes(brandFilter.toLowerCase())).length > 0 && (
          <div style={dropStyle}>
            {brands.filter(b => !brandFilter || b.toLowerCase().includes(brandFilter.toLowerCase())).map(b => (
              <div key={b} onClick={() => selectBrand(b)} style={itemStyle}
                onMouseEnter={e => e.target.style.background = "var(--card)"}
                onMouseLeave={e => e.target.style.background = "transparent"}>{b}</div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <label style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, display: "block", marginBottom: 2 }}>Model</label>
        <input value={modelFilter} onChange={e => { setModelFilter(e.target.value); onChange({ ...value, model: e.target.value }); setShowModels(true); }}
          onFocus={() => setShowModels(true)} placeholder="Model" style={inputStyle} />
        {showModels && filteredModels.length > 0 && (
          <div style={dropStyle}>
            {filteredModels.slice(0, 20).map((m, i) => (
              <div key={`${m.brand}-${m.model}-${i}`} onClick={() => selectModel(m)} style={itemStyle}
                onMouseEnter={e => e.target.style.background = "var(--card)"}
                onMouseLeave={e => e.target.style.background = "transparent"}>
                <span style={{ fontWeight: 500 }}>{m.model}</span>
                <span style={{ opacity: 0.5, marginLeft: 6, fontSize: 11 }}>{m.brand}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
