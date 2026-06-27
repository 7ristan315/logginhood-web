"use client";

import { useState, useMemo } from "react";
import InsightsNav from "./components/InsightsNav";
import GlobalFilters from "./components/GlobalFilters";
import PlatformOverview from "./components/PlatformOverview";
import ProductPerformance from "./components/ProductPerformance";
import MarketIntelligence from "./components/MarketIntelligence";
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

export default function InsightsShell({ stats, equipPerf, setupDna, arrowPerf, marketShare, journey, switching, catalog }) {
  const [section, setSection] = useState("overview");
  const [filters, setFilters] = useState({});

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
      <div>
        <h1 className="text-2xl font-bold" style={{ letterSpacing: "-0.3px" }}>Logginhood Insights</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Equipment performance analytics for the archery industry
        </p>
      </div>

      {/* Navigation */}
      <InsightsNav active={section} onChange={setSection} />

      {/* Global filters */}
      {section !== "methodology" && (
        <GlobalFilters filters={filters} onChange={setFilters} data={equipPerf} />
      )}

      {/* Section content */}
      {section === "overview" && (
        <PlatformOverview stats={stats} equipPerf={equipPerf} marketShare={marketShare} filtered={filtered} />
      )}

      {section === "products" && (
        <ProductPerformance equipPerf={filtered.equip} catalog={catalog || []} filters={filters} />
      )}

      {section === "market" && (
        <MarketIntelligence marketShare={marketShare} equipPerf={equipPerf} switching={switching} filtered={filtered} />
      )}

      {section === "demographics" && (
        <ArcherDemographics equipPerf={equipPerf} setupDna={setupDna} filtered={filtered} />
      )}

      {section === "arrows" && (
        <ArrowLab arrowPerf={arrowPerf} filtered={filtered} />
      )}

      {section === "journey" && (
        <EquipmentJourney journey={journey} filtered={filtered} />
      )}

      {section === "competitive" && (
        <CompetitiveEdge equipPerf={equipPerf} filtered={filtered} />
      )}

      {section === "methodology" && (
        <Methodology />
      )}
    </div>
  );
}
