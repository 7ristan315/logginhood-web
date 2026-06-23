const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Logginhood";
pres.title = "Logginhood Insights";

// Palette — dark premium with archery green/blue accent
const BG_DARK = "0F1419";
const BG_MID = "1A2332";
const BG_CARD = "1E2D3D";
const ACCENT = "1A9B6B";
const ACCENT2 = "1A6BBF";
const TEXT = "F0F4F8";
const TEXT_MUT = "8899AA";
const WHITE = "FFFFFF";
const WARN = "F59E0B";

const mkShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 45, opacity: 0.3 });

// ── Slide 1: Title ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: BG_DARK } });
  s.addText("LOGGINHOOD INSIGHTS", { x: 0.8, y: 1.2, w: 8.4, h: 0.8, fontSize: 42, fontFace: "Calibri", bold: true, color: WHITE, charSpacing: 4 });
  s.addText("The data archery manufacturers have never had.", { x: 0.8, y: 2.1, w: 8.4, h: 0.6, fontSize: 22, fontFace: "Calibri", color: ACCENT, italic: true });
  s.addText("Performance data tied to equipment. Anonymised. Aggregate. Actionable.", { x: 0.8, y: 3.3, w: 7, h: 0.5, fontSize: 14, fontFace: "Calibri", color: TEXT_MUT });
  s.addText("logginhood.com", { x: 0.8, y: 4.8, w: 4, h: 0.4, fontSize: 12, fontFace: "Calibri", color: TEXT_MUT });
})();

// ── Slide 2: The Problem ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("THE PROBLEM", { x: 0.8, y: 0.5, w: 8, h: 0.7, fontSize: 36, fontFace: "Calibri", bold: true, color: WHITE });
  const items = [
    { big: "You know what you sell.", sub: "Sales data tells you volume, price point, channel." },
    { big: "You don't know how it performs.", sub: "No manufacturer has real-world performance data tied to their equipment — or their competitors'." },
    { big: "Your R&D team is guessing.", sub: "Product development relies on pro team feedback and lab tests. Neither represents your actual customer base." },
  ];
  items.forEach((item, i) => {
    const y = 1.6 + i * 1.2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y, w: 8.4, h: 1.0, fill: { color: BG_CARD }, rectRadius: 0.08, shadow: mkShadow() });
    s.addText(item.big, { x: 1.1, y: y + 0.1, w: 7.8, h: 0.4, fontSize: 18, fontFace: "Calibri", bold: true, color: WHITE, margin: 0 });
    s.addText(item.sub, { x: 1.1, y: y + 0.5, w: 7.8, h: 0.35, fontSize: 13, fontFace: "Calibri", color: TEXT_MUT, margin: 0 });
  });
})();

// ── Slide 3: What We Capture ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("WHAT WE CAPTURE", { x: 0.8, y: 0.5, w: 8, h: 0.7, fontSize: 36, fontFace: "Calibri", bold: true, color: WHITE });
  s.addText("Every scored round is linked to a full equipment profile.", { x: 0.8, y: 1.2, w: 8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT_MUT });

  const left = [
    "Riser & limbs (brand, model)",
    "Arrows (brand, spine, length, points)",
    "Sight (brand, model, pin type)",
    "Stabilisers (long rod, short rods, V-bar)",
    "Button / plunger (brand, spring, position)",
    "Clicker, tab, release aid, scope",
  ];
  const right = [
    "Score per round (arrow-by-arrow)",
    "Gold count & hit count",
    "Round type & distance",
    "Consistency (standard deviation)",
    "Progression over time",
    "Age category, gender, bow type",
  ];

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.8, w: 4.0, h: 3.2, fill: { color: BG_CARD }, rectRadius: 0.08, shadow: mkShadow() });
  s.addText("EQUIPMENT", { x: 1.1, y: 1.9, w: 3.6, h: 0.4, fontSize: 14, fontFace: "Calibri", bold: true, color: ACCENT, margin: 0 });
  s.addText(left.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < left.length - 1, fontSize: 12, color: TEXT } })), { x: 1.1, y: 2.3, w: 3.5, h: 2.5, fontFace: "Calibri", paraSpaceAfter: 4 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 1.8, w: 4.0, h: 3.2, fill: { color: BG_CARD }, rectRadius: 0.08, shadow: mkShadow() });
  s.addText("PERFORMANCE", { x: 5.5, y: 1.9, w: 3.6, h: 0.4, fontSize: 14, fontFace: "Calibri", bold: true, color: ACCENT2, margin: 0 });
  s.addText(right.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < right.length - 1, fontSize: 12, color: TEXT } })), { x: 5.5, y: 2.3, w: 3.5, h: 2.5, fontFace: "Calibri", paraSpaceAfter: 4 });
})();

// ── Slide 4: Data Products ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("FIVE DATA PRODUCTS", { x: 0.8, y: 0.4, w: 8, h: 0.7, fontSize: 36, fontFace: "Calibri", bold: true, color: WHITE });

  const products = [
    { name: "Equipment Performance Index", desc: "A score for every product based on real archer performance", color: ACCENT },
    { name: "Switching Reports", desc: "What happens when archers change equipment", color: ACCENT2 },
    { name: "Setup DNA", desc: "What top archers actually shoot at each level", color: "E85D75" },
    { name: "The Journey Map", desc: "Equipment upgrades mapped to skill progression", color: WARN },
    { name: "Live Market Share", desc: "Real-time breakdown of what's being used", color: "9B59B6" },
  ];

  products.forEach((p, i) => {
    const y = 1.3 + i * 0.82;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.7, fill: { color: BG_CARD }, rectRadius: 0.06, shadow: mkShadow() });
    s.addShape(pres.shapes.OVAL, { x: 1.1, y: y + 0.2, w: 0.3, h: 0.3, fill: { color: p.color } });
    s.addText(p.name, { x: 1.6, y: y + 0.05, w: 4, h: 0.35, fontSize: 16, fontFace: "Calibri", bold: true, color: WHITE, margin: 0 });
    s.addText(p.desc, { x: 1.6, y: y + 0.35, w: 7, h: 0.3, fontSize: 12, fontFace: "Calibri", color: TEXT_MUT, margin: 0 });
  });
})();

// ── Slide 5: EPI Example ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("EQUIPMENT PERFORMANCE INDEX", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 30, fontFace: "Calibri", bold: true, color: WHITE });
  s.addText("Sights — Indoor Portsmouth (Recurve, Senior)", { x: 0.8, y: 1.0, w: 8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT_MUT });

  const rows = [
    [{ text: "PRODUCT", options: { bold: true, color: TEXT_MUT, fontSize: 11 } }, { text: "EPI SCORE", options: { bold: true, color: TEXT_MUT, fontSize: 11 } }, { text: "AVG SCORE", options: { bold: true, color: TEXT_MUT, fontSize: 11 } }, { text: "SAMPLE", options: { bold: true, color: TEXT_MUT, fontSize: 11 } }],
    [{ text: "Shibuya Ultima RC II", options: { bold: true, color: WHITE } }, { text: "84", options: { color: ACCENT, bold: true, fontSize: 18 } }, { text: "537", options: { color: TEXT } }, { text: "1,247", options: { color: TEXT_MUT } }],
    [{ text: "Axcel Achieve CX", options: { bold: true, color: WHITE } }, { text: "81", options: { color: ACCENT, bold: true, fontSize: 18 } }, { text: "521", options: { color: TEXT } }, { text: "892", options: { color: TEXT_MUT } }],
    [{ text: "Axcel AX2000", options: { bold: true, color: WHITE } }, { text: "79", options: { color: ACCENT2, bold: true, fontSize: 18 } }, { text: "508", options: { color: TEXT } }, { text: "634", options: { color: TEXT_MUT } }],
    [{ text: "Cartel Focus K", options: { bold: true, color: WHITE } }, { text: "72", options: { color: WARN, bold: true, fontSize: 18 } }, { text: "462", options: { color: TEXT } }, { text: "2,103", options: { color: TEXT_MUT } }],
    [{ text: "SF Axiom II", options: { bold: true, color: WHITE } }, { text: "68", options: { color: WARN, bold: true, fontSize: 18 } }, { text: "431", options: { color: TEXT } }, { text: "1,856", options: { color: TEXT_MUT } }],
  ];

  s.addTable(rows, {
    x: 0.8, y: 1.5, w: 8.4,
    colW: [3.5, 1.5, 1.5, 1.9],
    border: { pt: 0.5, color: "2A3A4A" },
    fill: { color: BG_CARD },
    rowH: [0.4, 0.5, 0.5, 0.5, 0.5, 0.5],
    fontFace: "Calibri",
    fontSize: 13,
  });

  s.addText("EPI normalises scores across skill levels and sample sizes. Higher = better average performance relative to peers.", { x: 0.8, y: 4.8, w: 8, h: 0.4, fontSize: 11, fontFace: "Calibri", color: TEXT_MUT, italic: true });
})();

// ── Slide 6: Switching Reports ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("SWITCHING REPORTS", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 30, fontFace: "Calibri", bold: true, color: WHITE });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.3, w: 8.4, h: 2.2, fill: { color: BG_CARD }, rectRadius: 0.08, shadow: mkShadow() });
  s.addText("Easton X10  →  Easton RX7", { x: 1.2, y: 1.4, w: 7, h: 0.5, fontSize: 20, fontFace: "Calibri", bold: true, color: WHITE, margin: 0 });
  s.addText("+2.3%", { x: 6.5, y: 1.4, w: 2.5, h: 0.8, fontSize: 48, fontFace: "Calibri", bold: true, color: ACCENT, align: "right", margin: 0 });
  s.addText("average score increase over 8 weeks", { x: 6.5, y: 2.1, w: 2.5, h: 0.3, fontSize: 11, fontFace: "Calibri", color: TEXT_MUT, align: "right", margin: 0 });

  // Before/after stats
  const stats = [
    { label: "Before avg", val: "498", sub: "Portsmouth" },
    { label: "After avg", val: "509", sub: "Portsmouth" },
    { label: "Consistency", val: "-12%", sub: "std dev improved" },
    { label: "Sample", val: "342", sub: "archers switched" },
  ];
  stats.forEach((st, i) => {
    const x = 1.2 + i * 2.0;
    s.addText(st.val, { x, y: 2.5, w: 1.8, h: 0.5, fontSize: 28, fontFace: "Calibri", bold: true, color: i === 2 ? ACCENT : WHITE, margin: 0 });
    s.addText(st.label, { x, y: 2.95, w: 1.8, h: 0.25, fontSize: 11, fontFace: "Calibri", color: TEXT_MUT, margin: 0 });
  });

  s.addText("Track what happens when archers switch any piece of equipment — arrows, sights, limbs, stabilisers. See the performance impact with statistical significance.", { x: 0.8, y: 3.8, w: 8.4, h: 0.6, fontSize: 13, fontFace: "Calibri", color: TEXT_MUT });
  s.addText('"We used Logginhood switching data to validate the RX7 launch. The +2.3% lift across 342 real-world switches was stronger than our internal testing predicted."', { x: 0.8, y: 4.5, w: 8.4, h: 0.5, fontSize: 12, fontFace: "Calibri", color: TEXT, italic: true });
  s.addText("— Example testimonial", { x: 0.8, y: 5.0, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Calibri", color: TEXT_MUT });
})();

// ── Slide 7: Setup DNA ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("SETUP DNA", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 30, fontFace: "Calibri", bold: true, color: WHITE });
  s.addText("What does a 500+ Portsmouth archer actually shoot?", { x: 0.8, y: 1.0, w: 8, h: 0.4, fontSize: 16, fontFace: "Calibri", color: ACCENT, italic: true });

  const dna = [
    { cat: "Arrows", val: "78% Easton X10 · 15% ACE · 7% Other", pct: 78 },
    { cat: "Spine", val: "600 (62%) · 550 (28%) · 500 (10%)", pct: 62 },
    { cat: "Sight", val: "Shibuya (54%) · Axcel (31%) · Other (15%)", pct: 54 },
    { cat: "Draw weight", val: "36-40 lbs (58%) · 40-44 lbs (32%)", pct: 58 },
    { cat: "Long rod", val: '28"+ (71%) · 26-28" (22%)', pct: 71 },
    { cat: "Clicker", val: "91% use a blade clicker", pct: 91 },
  ];

  dna.forEach((d, i) => {
    const y = 1.6 + i * 0.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.5, fill: { color: BG_CARD }, rectRadius: 0.05 });
    // Progress bar
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y, w: 8.4 * (d.pct / 100), h: 0.5, fill: { color: ACCENT, transparency: 75 }, rectRadius: 0.05 });
    s.addText(d.cat, { x: 1.0, y, w: 2, h: 0.5, fontSize: 13, fontFace: "Calibri", bold: true, color: WHITE, margin: 0, valign: "middle" });
    s.addText(d.val, { x: 3.0, y, w: 6, h: 0.5, fontSize: 12, fontFace: "Calibri", color: TEXT, margin: 0, valign: "middle" });
  });

  s.addText("Segment by any combination: bow type, age, gender, skill level, round type, indoor/outdoor.", { x: 0.8, y: 4.8, w: 8.4, h: 0.4, fontSize: 12, fontFace: "Calibri", color: TEXT_MUT });
})();

// ── Slide 8: Journey Map ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("THE JOURNEY MAP", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 30, fontFace: "Calibri", bold: true, color: WHITE });
  s.addText("Equipment upgrades mapped to archer progression", { x: 0.8, y: 1.0, w: 8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT_MUT });

  const steps = [
    { score: "300", level: "Beginner", equip: "Club bow\nBasic aluminium arrows\nNo sight or basic sight", color: "6B7280" },
    { score: "400", level: "Developing", equip: "First own bow (entry riser)\nCarbon arrows (700 spine)\nBasic sight + finger tab", color: ACCENT2 },
    { score: "500", level: "Intermediate", equip: "Mid-range riser + limbs\nX10 / ACE (600 spine)\nShibuya/Axcel sight + clicker", color: ACCENT },
    { score: "550+", level: "Advanced", equip: "Top-end riser\nX10 (550 spine)\nFull stabiliser setup", color: WARN },
  ];

  steps.forEach((st, i) => {
    const x = 0.6 + i * 2.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 2.15, h: 3.2, fill: { color: BG_CARD }, rectRadius: 0.1, shadow: mkShadow() });
    s.addText(st.score, { x, y: 1.7, w: 2.15, h: 0.6, fontSize: 28, fontFace: "Calibri", bold: true, color: st.color, align: "center", margin: 0 });
    s.addText(st.level, { x, y: 2.25, w: 2.15, h: 0.35, fontSize: 13, fontFace: "Calibri", bold: true, color: WHITE, align: "center", margin: 0 });
    s.addText(st.equip, { x: x + 0.15, y: 2.7, w: 1.85, h: 1.8, fontSize: 11, fontFace: "Calibri", color: TEXT_MUT, valign: "top", margin: 0 });
    if (i < steps.length - 1) {
      s.addText("→", { x: x + 2.15, y: 2.8, w: 0.2, h: 0.5, fontSize: 20, fontFace: "Calibri", color: TEXT_MUT, align: "center" });
    }
  });

  s.addText("Know exactly when your customer is ready to upgrade — and what they'll upgrade to.", { x: 0.8, y: 5.0, w: 8.4, h: 0.3, fontSize: 13, fontFace: "Calibri", color: ACCENT, italic: true });
})();

// ── Slide 9: Market Share ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("LIVE MARKET SHARE", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 30, fontFace: "Calibri", bold: true, color: WHITE });
  s.addText("Arrow brands by skill level — updated weekly", { x: 0.8, y: 1.0, w: 8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT_MUT });

  s.addChart(pres.charts.BAR, [
    { name: "Easton", labels: ["Beginner", "Developing", "Intermediate", "Advanced", "Elite"], values: [45, 52, 68, 78, 85] },
    { name: "Carbon Express", labels: ["Beginner", "Developing", "Intermediate", "Advanced", "Elite"], values: [20, 18, 12, 8, 5] },
    { name: "Gold Tip", labels: ["Beginner", "Developing", "Intermediate", "Advanced", "Elite"], values: [15, 14, 10, 7, 4] },
    { name: "Other", labels: ["Beginner", "Developing", "Intermediate", "Advanced", "Elite"], values: [20, 16, 10, 7, 6] },
  ], {
    x: 0.8, y: 1.5, w: 8.4, h: 3.5,
    barDir: "col",
    barGrouping: "stacked",
    chartColors: [ACCENT, ACCENT2, "E85D75", "4A5568"],
    chartArea: { fill: { color: BG_CARD }, roundedCorners: true },
    catAxisLabelColor: TEXT_MUT,
    valAxisLabelColor: TEXT_MUT,
    valGridLine: { color: "2A3A4A", size: 0.5 },
    catGridLine: { style: "none" },
    showLegend: true,
    legendPos: "b",
    legendColor: TEXT_MUT,
    legendFontSize: 10,
    showValue: false,
  });

  s.addText("Filter by: country, bow type, age group, round type, indoor/outdoor, date range", { x: 0.8, y: 5.1, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Calibri", color: TEXT_MUT });
})();

// ── Slide 10: Privacy ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("DATA INTEGRITY & PRIVACY", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 30, fontFace: "Calibri", bold: true, color: WHITE });

  const points = [
    { title: "Fully anonymised", desc: "No names, no emails, no club identifiers. Aggregate data only." },
    { title: "GDPR compliant", desc: "UK data protection regulations built in from day one. Users consent to anonymised data use." },
    { title: "Minimum sample size: 50", desc: "No data point is surfaced unless backed by 50+ archers. Prevents de-anonymisation." },
    { title: "No individual tracking", desc: "Manufacturers see trends across populations, never individual archers." },
  ];

  points.forEach((p, i) => {
    const y = 1.4 + i * 0.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.8, fill: { color: BG_CARD }, rectRadius: 0.08, shadow: mkShadow() });
    s.addShape(pres.shapes.OVAL, { x: 1.15, y: y + 0.22, w: 0.35, h: 0.35, fill: { color: ACCENT } });
    s.addText("✓", { x: 1.15, y: y + 0.2, w: 0.35, h: 0.35, fontSize: 16, fontFace: "Calibri", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(p.title, { x: 1.7, y: y + 0.1, w: 7, h: 0.35, fontSize: 16, fontFace: "Calibri", bold: true, color: WHITE, margin: 0 });
    s.addText(p.desc, { x: 1.7, y: y + 0.42, w: 7, h: 0.3, fontSize: 12, fontFace: "Calibri", color: TEXT_MUT, margin: 0 });
  });
})();

// ── Slide 11: Scale ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("SCALE", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 36, fontFace: "Calibri", bold: true, color: WHITE });

  const metrics = [
    { val: "5,000+", label: "Active archers", sub: "Scoring weekly on the platform" },
    { val: "80,000+", label: "Scored rounds", sub: "Arrow-by-arrow data with equipment profiles" },
    { val: "12%", label: "Monthly growth", sub: "Organic — word of mouth in clubs" },
  ];

  metrics.forEach((m, i) => {
    const x = 0.8 + i * 3.0;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.4, w: 2.7, h: 2.8, fill: { color: BG_CARD }, rectRadius: 0.1, shadow: mkShadow() });
    s.addText(m.val, { x, y: 1.7, w: 2.7, h: 0.8, fontSize: 44, fontFace: "Calibri", bold: true, color: ACCENT, align: "center", margin: 0 });
    s.addText(m.label, { x, y: 2.5, w: 2.7, h: 0.4, fontSize: 16, fontFace: "Calibri", bold: true, color: WHITE, align: "center", margin: 0 });
    s.addText(m.sub, { x: x + 0.2, y: 3.0, w: 2.3, h: 0.6, fontSize: 12, fontFace: "Calibri", color: TEXT_MUT, align: "center", margin: 0 });
  });

  s.addText("Every new archer adds equipment data. Every scored round enriches the dataset. The moat deepens daily.", { x: 0.8, y: 4.6, w: 8.4, h: 0.5, fontSize: 14, fontFace: "Calibri", color: TEXT_MUT, italic: true });
})();

// ── Slide 12: Pricing ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("PRICING", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontSize: 36, fontFace: "Calibri", bold: true, color: WHITE });

  const tiers = [
    { name: "STARTER", price: "£500", period: "/month", features: ["Market share dashboard", "Equipment Performance Index", "Filter by bow type & round", "Weekly data updates"], color: TEXT_MUT },
    { name: "PRO", price: "£1,500", period: "/month", features: ["Everything in Starter", "Switching Reports", "The Journey Map", "Setup DNA segmentation", "Monthly trend reports"], color: ACCENT },
    { name: "ENTERPRISE", price: "Custom", period: "", features: ["Everything in Pro", "Raw aggregate API access", "Custom report builder", "Branded competitor analysis", "Dedicated account manager"], color: WARN },
  ];

  tiers.forEach((t, i) => {
    const x = 0.6 + i * 3.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.2, w: 2.95, h: 3.8, fill: { color: BG_CARD }, rectRadius: 0.1, shadow: mkShadow() });
    s.addText(t.name, { x, y: 1.35, w: 2.95, h: 0.35, fontSize: 13, fontFace: "Calibri", bold: true, color: t.color, align: "center", charSpacing: 3, margin: 0 });
    s.addText(t.price, { x, y: 1.75, w: 2.95, h: 0.6, fontSize: 36, fontFace: "Calibri", bold: true, color: WHITE, align: "center", margin: 0 });
    s.addText(t.period, { x, y: 2.25, w: 2.95, h: 0.3, fontSize: 12, fontFace: "Calibri", color: TEXT_MUT, align: "center", margin: 0 });
    s.addText(t.features.map((f, j) => ({ text: f, options: { bullet: true, breakLine: j < t.features.length - 1, fontSize: 11, color: TEXT } })), { x: x + 0.3, y: 2.7, w: 2.35, h: 2.0, fontFace: "Calibri", paraSpaceAfter: 4 });
  });
})();

// ── Slide 13: CTA ──
(() => {
  const s = pres.addSlide();
  s.background = { color: BG_DARK };
  s.addText("SEE YOUR BRAND'S DATA", { x: 0.8, y: 1.5, w: 8.4, h: 0.8, fontSize: 40, fontFace: "Calibri", bold: true, color: WHITE, align: "center" });
  s.addText("Book a 20-minute demo and we'll show you your equipment's real-world performance data — free, no commitment.", { x: 1.5, y: 2.5, w: 7, h: 0.6, fontSize: 16, fontFace: "Calibri", color: TEXT_MUT, align: "center" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.2, y: 3.4, w: 3.6, h: 0.7, fill: { color: ACCENT }, rectRadius: 0.08, shadow: mkShadow() });
  s.addText("insights@logginhood.com", { x: 3.2, y: 3.4, w: 3.6, h: 0.7, fontSize: 18, fontFace: "Calibri", bold: true, color: WHITE, align: "center", valign: "middle" });

  s.addText("logginhood.com", { x: 0.8, y: 4.8, w: 8.4, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TEXT_MUT, align: "center" });
})();

// Write
const outPath = "C:\\logginhood_web\\public\\logginhood-insights-deck.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Deck saved to " + outPath);
});
