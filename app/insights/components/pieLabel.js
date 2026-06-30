// Shared pie slice label: % inside large slices (white w/ dark outline), name+% outside for small ones.
const RAD = Math.PI / 180;

export function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.03) return null;
  const pct = Math.round(percent * 100);
  if (percent >= 0.06) {
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text x={x} y={y} fill="#fff" stroke="rgba(0,0,0,0.5)" strokeWidth={2.6} paintOrder="stroke"
        textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{pct}%</text>
    );
  }
  const r = outerRadius + 12;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="var(--text-secondary)" textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central" fontSize={11}>{`${name} ${pct}%`}</text>
  );
}
