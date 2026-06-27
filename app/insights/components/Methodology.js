const SECTIONS = [
  {
    title: "Equipment Performance Index (EPI)",
    content: "The EPI uses the Wilson score confidence interval, a Bayesian method originally developed for binomial proportions. We normalise each score against the round maximum, then apply Wilson scoring with z=1.96 (95% confidence). A product with 5 scores averaging 90% will rank lower than one with 500 scores averaging 85% — sample size matters.",
  },
  {
    title: "Product comparison",
    content: "Head-to-head comparisons aggregate all rounds shot with each product, weighted by sample size. Consistency is measured as 100 minus the standard deviation — higher is better. Products must have a minimum sample size to appear. Comparisons are most meaningful within the same round type and bow type.",
  },
  {
    title: "Market share",
    content: "Market share is counted by unique active archers, not scores, to prevent high-volume shooters from skewing the data. Only currently active setups are counted. A single archer with two bows counts once per bow type.",
  },
  {
    title: "Switching analysis",
    content: "When an archer's setup version changes between consecutive scored rounds of the same type, we flag it as a switching event. The before/after comparison uses a paired analysis — same archer, same round type, different equipment. This controls for archer skill and isolates the equipment variable.",
  },
  {
    title: "Archer demographics",
    content: "Archers are segmented by age category, gender, and score bracket. Score brackets divide the population into skill tiers. Each archer is counted once per bracket based on their average score for the filtered round/bow combination.",
  },
  {
    title: "Arrow Lab",
    content: "Arrow performance scatter plots show average score vs consistency (100 - standard deviation). The top-right quadrant represents high performance AND high consistency — the sweet spot. Spine analysis correlates arrow spine with average score to identify optimal configurations.",
  },
  {
    title: "Competitive Edge",
    content: "Compares equipment performance in competition settings vs practice. 'Pressure performers' are products where the average competition score exceeds the practice score — indicating the equipment (and archers who choose it) hold up under tournament conditions.",
  },
  {
    title: "Data integrity & privacy",
    content: "All data is anonymised — no names, emails, or club identifiers are exposed. Minimum sample sizes (5-50 depending on the analysis) prevent de-anonymisation through small-group inference. GDPR compliant. Users consent to anonymised aggregate data use at signup.",
  },
];

export default function Methodology() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h3 className="text-base font-semibold">How we calculate everything</h3>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
          Transparency in methodology builds trust. Every metric on this platform is documented here.
        </p>
      </div>
      {SECTIONS.map(s => (
        <div key={s.title} className="card">
          <h4 className="text-sm font-semibold mb-2">{s.title}</h4>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.content}</p>
        </div>
      ))}
    </div>
  );
}
