"use client";

import { useState, useMemo } from "react";
import InsightsNav from "./components/InsightsNav";
import GlobalFilters from "./components/GlobalFilters";
import PlatformOverview from "./components/PlatformOverview";
import ProductPerformance from "./components/ProductPerformance";
import MarketIntelligence from "./components/MarketIntelligence";
import MarketDrilldown from "./components/MarketDrilldown";
import BrandHealth from "./components/BrandHealth";
import ArcherDemographics from "./components/ArcherDemographics";
import ArrowLab from "./components/ArrowLab";
import EquipmentJourney from "./components/EquipmentJourney";
import CompetitiveEdge from "./components/CompetitiveEdge";
import Methodology from "./components/Methodology";

function applyFilters(data, filters) {
  return (data || []).filter(row => {
    for (const [key, val] of Object.entries(filters)) {
      if (val && String(row[key]) !== val) return false;
    }
    return true;
  });
}

const TIER_LABELS = { admin: "Admin", enterprise: "Enterprise", professional: "Professional", starter: "Starter" };
const TIER_UPGRADE = {
  starter: { next: "Professional", price: "£750/mo", unlocks: "Product comparison, demographics, arrow lab" },
  professional: { next: "Enterprise", price: "£2,000/mo", unlocks: "Equipment journey, competitive edge, API access" },
};

function LockedSection({ tier }) {
  const upgrade = TIER_UPGRADE[tier];
  if (!upgrade) return null;
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-4xl">🔒</span>
      <h3 className="text-lg font-semibold">Upgrade to {upgrade.next}</h3>
      <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
        This section requires the {upgrade.next} tier ({upgrade.price}). Unlocks: {upgrade.unlocks}.
      </p>
      <a href="mailto:tristan@logginhood.com?subject=Upgrade%20to%20{upgrade.next}" className="btn-primary">
        Request upgrade
      </a>
    </div>
  );
}

export default function InsightsShell({ stats, equipPerf, setupDna, arrowPerf, marketShare, journey, switching, catalog, zoneDist, tier = "admin", allowedSections, companyName, brandFilter }) {
  const [section, setSection] = useState("overview");
  const [filters, setFilters] = useState({});
  const allowed = new Set(allowedSections || ["overview", "products", "market", "demographics", "arrows", "journey", "competitive", "methodology"]);

  const filtered = useMemo(() => ({
    equip: applyFilters(equipPerf, filters),
    dna: applyFilters(setupDna, filters),
    arrows: applyFilters(arrowPerf, filters),
    market: applyFilters(marketShare, filters),
    journey: applyFilters(journey, filters),
  }), [equipPerf, setupDna, arrowPerf, marketShare, journey, filters]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: "-0.3px" }}>Logginhood Insights</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Equipment performance analytics for the archery industry
          </p>
        </div>
        <div className="flex items-center gap-2">
          {companyName && <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{companyName}</span>}
          <span className="text-xs font-semibold py-1 px-3 rounded-full" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
            {TIER_LABELS[tier] || tier}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <InsightsNav active={section} onChange={setSection} allowedSections={allowed} tier={tier} />

      {/* Global filters */}
      {section !== "methodology" && (
        <GlobalFilters filters={filters} onChange={setFilters} data={equipPerf} />
      )}

      {/* Section content */}
      {section === "overview" && (
        <PlatformOverview stats={stats} equipPerf={equipPerf} marketShare={marketShare} filtered={filtered} />
      )}

      {section === "products" && (allowed.has("products") ? (
        <ProductPerformance equipPerf={filtered.equip} catalog={catalog || []} filters={filters} />
      ) : <LockedSection tier={tier} />)}

      {section === "market" && (
        <div className="flex flex-col gap-6">
          <MarketDrilldown marketShare={filtered.market} equipPerf={filtered.equip} />
          <BrandHealth equipPerf={equipPerf} marketShare={marketShare} switching={switching} />
          <MarketIntelligence marketShare={marketShare} equipPerf={equipPerf} switching={switching} filtered={filtered} />
        </div>
      )}

      {section === "demographics" && (allowed.has("demographics") ? (
        <ArcherDemographics equipPerf={equipPerf} setupDna={setupDna} filtered={filtered} />
      ) : <LockedSection tier={tier} />)}

      {section === "arrows" && (allowed.has("arrows") ? (
        <ArrowLab arrowPerf={arrowPerf} filtered={filtered} zoneDist={zoneDist || []} />
      ) : <LockedSection tier={tier} />)}

      {section === "journey" && (allowed.has("journey") ? (
        <EquipmentJourney journey={journey} filtered={filtered} />
      ) : <LockedSection tier={tier} />)}

      {section === "competitive" && (allowed.has("competitive") ? (
        <CompetitiveEdge equipPerf={equipPerf} filtered={filtered} />
      ) : <LockedSection tier={tier} />)}

      {section === "methodology" && (
        <Methodology />
      )}
    </div>
  );
}
