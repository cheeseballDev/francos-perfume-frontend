const ForecastChart = ({ data }) => {
  const W  = 900; const H  = 300;
  const PL = 70;  const PR = 20; const PT = 16; const PB = 36;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  if (!data || data.length === 0) {
      return (
            <div className="p-4">
                <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    No chart data available. Generate a forecast.
                </div>
            </div>
      );
  }

  const maxVal  = Math.max(...data.map((d) => d.upper || 0), 1000);
  const MAX_Y   = Math.ceil(maxVal / 10000) * 10000 || 60000;
  const Y_TICKS = Array.from({ length: 5 }, (_, i) => Math.round((MAX_Y / 4) * i));

  const n    = Math.max(data.length, 2);
  const toY  = (val) => PT + (1 - val / MAX_Y) * cH;
  const toX  = (i)   => PL + (i / (n - 1)) * cW;
  const pts  = (acc) => data.map((d, i) => ({ x: toX(i), y: toY(acc(d)) }));

  const catmullRomPath = (points) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const upperPts = pts((d) => d.upper || 0);
  const lowerPts = pts((d) => d.lower || 0);
  const bandPath =
    upperPts.length > 1 && lowerPts.length > 1
      ? catmullRomPath(upperPts) +
        " L " + lowerPts[lowerPts.length - 1].x + "," + lowerPts[lowerPts.length - 1].y +
        " " + catmullRomPath([...lowerPts].reverse()).replace(/^M [^ ]+ /, "L ") +
        " Z"
      : "";

  const linePath       = catmullRomPath(pts((d) => d.value || 0));
  const lastActualIdx  = data.reduce((acc, d, i) => (d.isActual ? i : acc), -1);

  const fmtY = (v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[650px] h-auto" role="img">
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line x1={PL} y1={toY(tick)} x2={W - PR} y2={toY(tick)} stroke="currentColor" className="text-border" strokeWidth="1" />
            <text x={PL - 8} y={toY(tick)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="currentColor" className="text-muted-foreground">
              {fmtY(tick)}
            </text>
          </g>
        ))}

        {data.map((d, i) => (
          <text key={d.month || i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor" className="text-muted-foreground">
            {d.month}
          </text>
        ))}

        {bandPath && <path d={bandPath} className="fill-primary/20" />}
        {linePath && <path d={linePath} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}

        {data.map((d, idx) => {
          const arrIdx = data.indexOf(d);
          const cx = toX(arrIdx); const cy = toY(d.value || 0); const s = 5;
          return <polygon key={idx} points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`} fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="text-primary stroke-background" />;
        })}
      </svg>
    </div>
  );
};

export default ForecastChart;