import {
  AlertTriangle,
  BarChart2,
  ChevronDown,
  ChevronsUp,
  Eye,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

// Shared component used on the Dashboard home page — reused here for consistency
import StatusCard from "../../components/data_components/StatusCard";

// shadcn components — Card for section containers, Badge for labels,
// Button for interactive controls, Separator for row dividers
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

{
  /*
    TEMP DATA
    🔌 Replace all static arrays below with .NET API calls when the backend is ready
  */
}

// Summary metric cards displayed in the 4-card row at the top of the page.
// These reuse the same StatusCard component as the Dashboard home page.
const metricCards = [
  {
    title: "Forecast Accuracy",
    mainValue: "69.67%",
    secondValue: "+12%",
    subText: " from last period",
    Icon: TrendingUp,
    color: "text-custom-green",
  },
  {
    title: "Predicted Growth",
    mainValue: "+18.42%",
    subText: "Expected over 6 months",
    Icon: BarChart2,
    color: "text-custom-purple",
  },
  {
    title: "High Confidence Items",
    mainValue: 12,
    secondValue: "87%",
    subText: " prediction accuracy",
    Icon: ChevronsUp,
    color: "text-custom-blue",
  },
  {
    title: "Restock Alerts",
    mainValue: 3,
    secondValue: "Requires attention",
    Icon: AlertTriangle,
    color: "text-custom-yellow",
  },
];

// Monthly sales chart data.
//   value    = actual sales (historical) or predicted demand (forecast)
//   upper    = upper confidence bound
//   lower    = lower confidence bound
//   isActual = true → historical segment; false → forecast segment (gets dot markers)
const chartData = [
  { month: "Jan", value: 2900, upper: 3500, lower: 2200, isActual: true  },
  { month: "Feb", value: 1700, upper: 2500, lower: 1000, isActual: true  },
  { month: "Mar", value: 3050, upper: 3800, lower: 2300, isActual: true  },
  { month: "Apr", value: 3200, upper: 4000, lower: 2400, isActual: true  },
  { month: "May", value: 3300, upper: 4100, lower: 2500, isActual: true  },
  { month: "Jun", value: 3500, upper: 4300, lower: 2700, isActual: false },
  { month: "Jul", value: 3800, upper: 4600, lower: 3000, isActual: false },
  { month: "Aug", value: 4300, upper: 5200, lower: 3400, isActual: false },
];

// Per-perfume demand forecast shown in the expandable list below the chart.
//   change > 0 → demand exceeds current stock (reorder needed)
//   change < 0 → demand is lower than stock (potential overstock)
const perfumeForecasts = [
  { id: "01", name: "Apricot Premium", trend: "up",   currentStock: 123, predictedDemand: 250, change:  127, confidence: 77 },
  { id: "02", name: "Rose Classic",    trend: "down", currentStock: 200, predictedDemand: 150, change: -100, confidence: 77 },
  { id: "03", name: "Midnight Wood",   trend: "up",   currentStock:  80, predictedDemand: 180, change:  100, confidence: 65 },
  { id: "04", name: "Ocean Breeze",    trend: "up",   currentStock: 150, predictedDemand: 200, change:   50, confidence: 82 },
  { id: "05", name: "Velvet Rose",     trend: "down", currentStock: 300, predictedDemand: 100, change: -200, confidence: 71 },
];

// AI-generated insight cards rendered in the 2×2 grid at the bottom.
// Each entry has its own colour scheme reflecting the insight category.
const aiInsights = [
  {
    title: "High Demand Expected",
    description: "Apricot Perfume expected to increase by 12% in 2 months",
    Icon: TrendingUp,
    bg: "bg-green-50",
    border: "border-green-100",
    iconColor: "text-custom-green",
  },
  {
    title: "Stock Level Shortage Warning",
    description: "Apricot Perfume may run out of stock on May",
    Icon: AlertTriangle,
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    iconColor: "text-custom-yellow",
  },
  {
    title: "Pattern Detected",
    description: "Rose Classic shows 15% increase during spring months",
    Icon: Eye,
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    iconColor: "text-custom-blue",
  },
  {
    title: "Declining Interest",
    description: "Rose Classic showing downward trend",
    Icon: TrendingDown,
    bg: "bg-red-50",
    border: "border-red-100",
    iconColor: "text-custom-red",
  },
];

{
  /* END OF TEMP DATA */
}

/* ─────────────────────────────────────────────────────────────────────────
   ForecastChart
   A self-contained SVG chart — no external library needed.

   Draws:
     1. Y-axis grid lines + numeric labels (0 → 6 000)
     2. X-axis month labels (Jan → Aug)
     3. Filled confidence-interval polygon (upper bound → lower bound)
     4. Smooth sales line built with Catmull-Rom → cubic-Bézier conversion
        so the line curves naturally through every data point
     5. Diamond markers on forecast data points + the last actual point

   Props:
     data — array of { month, value, upper, lower, isActual }
   ───────────────────────────────────────────────────────────────────────── */
const ForecastChart = ({ data }) => {
  // ── Canvas layout ──────────────────────────────────────────────────────
  const W  = 900;          // SVG viewBox width
  const H  = 300;          // SVG viewBox height
  const PL = 55;           // left padding  — room for y-axis labels
  const PR = 20;           // right padding
  const PT = 16;           // top padding
  const PB = 36;           // bottom padding — room for x-axis labels
  const cW = W - PL - PR;  // usable chart width
  const cH = H - PT - PB;  // usable chart height

  const MAX_Y   = 6000;
  const Y_TICKS = [0, 1500, 3000, 4500, 6000];
  const n       = data.length;

  // value → SVG y (0 at bottom, MAX_Y at top)
  const toY = (val) => PT + (1 - val / MAX_Y) * cH;
  // index → SVG x, evenly spaced
  const toX = (i) => PL + (i / (n - 1)) * cW;

  // Build an array of {x, y} objects for a given value accessor
  const pts = (accessor) => data.map((d, i) => ({ x: toX(i), y: toY(accessor(d)) }));

  // Catmull-Rom → cubic-Bézier conversion.
  // Produces an SVG path string that passes exactly through all given points
  // with smooth tangents — much nicer than a jagged polyline.
  const catmullRomPath = (points) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      // Clamp neighbours at the ends so we don't need phantom points
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      // Control points derived from adjacent segments (tension = 1/6)
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  // Confidence band: trace upper bound left→right, lower bound right→left,
  // then close the polygon so it fills the area between the two curves.
  const upperPts  = pts((d) => d.upper);
  const lowerPts  = pts((d) => d.lower);
  const bandPath  =
    catmullRomPath(upperPts) +
    " L " + lowerPts[lowerPts.length - 1].x + "," + lowerPts[lowerPts.length - 1].y +
    " " + catmullRomPath([...lowerPts].reverse()).replace(/^M [^ ]+ /, "L ") +
    " Z";

  // Main sales line — single smooth path across all data points
  const linePath = catmullRomPath(pts((d) => d.value));

  // Index of the last actual data point (where the forecast begins)
  const lastActualIdx = data.reduce((acc, d, i) => (d.isActual ? i : acc), -1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Sales Forecast Chart with Confidence Interval"
    >
      {/* ── Grid lines + Y-axis labels ── */}
      {Y_TICKS.map((tick) => (
        <g key={tick}>
          <line
            x1={PL}     y1={toY(tick)}
            x2={W - PR} y2={toY(tick)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <text
            x={PL - 8} y={toY(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="11"
            fill="#9ca3af"
          >
            {tick}
          </text>
        </g>
      ))}

      {/* ── X-axis month labels ── */}
      {data.map((d, i) => (
        <text
          key={d.month}
          x={toX(i)} y={H - 8}
          textAnchor="middle"
          fontSize="11"
          fill="#9ca3af"
        >
          {d.month}
        </text>
      ))}

      {/* ── Confidence interval band (filled area between upper/lower bounds) ── */}
      <path
        d={bandPath}
        fill="#bfdbfe"
        opacity="0.4"
      />

      {/* ── Main sales line (actual + predicted, one continuous smooth path) ── */}
      <path
        d={linePath}
        fill="none"
        stroke="#0d9488"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Diamond markers on forecast data points ────────────────────────────
           Small rotated squares drawn at each predicted value to distinguish
           the forecast segment from the historical segment visually.
      ─────────────────────────────────────────────────────────────────────── */}
      {data
        .filter((d) => !d.isActual)
        .map((d) => {
          const idx = data.indexOf(d);
          const cx = toX(idx);
          const cy = toY(d.value);
          const s  = 5;
          return (
            <polygon
              key={d.month}
              points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
              fill="#0d9488"
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}

      {/* ── Marker at the last actual point (the actual → forecast transition) ── */}
      {lastActualIdx >= 0 && (() => {
        const cx = toX(lastActualIdx);
        const cy = toY(data[lastActualIdx].value);
        const s  = 5;
        return (
          <polygon
            points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
            fill="#0d9488"
            stroke="white"
            strokeWidth="1.5"
          />
        );
      })()}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   ForecastPage — Main Page Component

   Uses shadcn Card / Badge / Button / Separator components throughout.
   The chart, perfume forecast list, and AI insights each live inside a Card.
   ───────────────────────────────────────────────────────────────────────── */
const ForecastPage = () => {
  // Controls whether all perfume rows are shown or just the first 2
  const [showAll, setShowAll] = useState(false);
  const visiblePerfumes = showAll ? perfumeForecasts : perfumeForecasts.slice(0, 2);

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Page Header ───────────────────────────────────────────────────────
           Matches the heading pattern used across all other dashboard pages.
      ─────────────────────────────────────────────────────────────────────── */}
      <h1 className="text-[32px] font-bold text-custom-black mb-2 leading-none tracking-tight">
        Sales Forecast
      </h1>
      <p className="text-custom-gray text-sm mb-8">
        Predictive analytics and trend analysis for inventory planning
      </p>

      {/* ── Metric Summary Cards ──────────────────────────────────────────────
           Reuses the shared StatusCard (same as Dashboard home).
           auto-fit grid so cards wrap gracefully on narrower viewports.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-6">
        {metricCards.map((card, i) => (
          <StatusCard
            key={i}
            title={card.title}
            mainValue={card.mainValue}
            secondValue={card.secondValue}
            subText={card.subText}
            Icon={card.Icon}
            color={card.color}
          />
        ))}
      </div>

      {/* ── Sales Forecast Chart ─────────────────────────────────────────────
           shadcn Card wraps the SVG chart and its legend.
           The ForecastChart component above handles all SVG rendering.
      ─────────────────────────────────────────────────────────────────────── */}
      <Card className="mb-6 border-custom-gray-2">
        <CardHeader>
          <CardTitle className="text-base text-custom-black">
            Sales Forecast with Confidence Interval
          </CardTitle>
          <CardDescription>
            Historical data vs predicted values with upper and lower bounds
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Responsive SVG — fills its container and scales down on narrow screens */}
          <ForecastChart data={chartData} />

          {/* Legend — each item is a mini SVG line swatch + a text label */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3 text-xs text-custom-gray">
            {[
              { color: "#9ca3af", dashed: true,  label: "Upper Bound"     },
              { color: "#9ca3af", dashed: true,  label: "Lower Bound"     },
              { color: "#0d9488", dashed: false, label: "Actual Sales"    },
              { color: "#0d9488", dashed: true,  label: "Predicted Sales" },
            ].map(({ color, dashed, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <svg width="24" height="8" aria-hidden="true">
                  <line
                    x1="0" y1="4" x2="24" y2="4"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray={dashed ? "4 3" : undefined}
                  />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Perfume-Level Forecast ────────────────────────────────────────────
           Lists each perfume's stock vs predicted demand.
           Rows are separated by a Separator and the list can be expanded
           with the "View All" Button in the card header.
      ─────────────────────────────────────────────────────────────────────── */}
      <Card className="mb-6 border-custom-gray-2">
        <CardHeader>
          {/* Title row with the View All / Show Less toggle on the right */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-base text-custom-black">
                Perfume-Level Forecast
              </CardTitle>
              <CardDescription>
                Individual perfume predictions with confidence levels
              </CardDescription>
            </div>

            {/* shadcn Button — ghost variant keeps it visually lightweight */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-custom-black hover:text-custom-gray gap-1.5 shrink-0"
            >
              {showAll ? "Show Less" : "View All"}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="flex flex-col">
            {visiblePerfumes.map((perfume, i) => (
              <div key={perfume.id}>
                {/* Separator between rows — not before the first row */}
                {i > 0 && <Separator className="my-4 bg-custom-gray-2" />}

                {/* Perfume name + trend direction arrow */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-custom-black">{perfume.name}</span>
                  {/* Green for rising demand, red for falling demand */}
                  {perfume.trend === "up" ? (
                    <TrendingUp size={15} className="text-custom-green" />
                  ) : (
                    <TrendingDown size={15} className="text-custom-red" />
                  )}
                </div>

                {/* Stats row: current stock | predicted demand | change | confidence badge */}
                <div className="flex items-center gap-10 text-sm pl-4">
                  <div>
                    <p className="text-custom-gray text-xs mb-0.5">Current stock</p>
                    <p className="font-semibold text-custom-black text-xl leading-none">
                      {perfume.currentStock}
                    </p>
                  </div>

                  <div>
                    <p className="text-custom-gray text-xs mb-0.5">Predicted Demand</p>
                    <p className="font-semibold text-custom-black text-xl leading-none">
                      {perfume.predictedDemand}
                    </p>
                  </div>

                  <div>
                    <p className="text-custom-gray text-xs mb-0.5">Change</p>
                    {/* Positive change is green, negative is red */}
                    <p className={`font-semibold text-xl leading-none ${
                      perfume.change >= 0 ? "text-custom-green" : "text-custom-red"
                    }`}>
                      {perfume.change >= 0 ? `+${perfume.change}` : perfume.change}
                    </p>
                  </div>

                  {/* shadcn Badge — outline variant with custom muted styling */}
                  <div className="ml-auto">
                    <Badge
                      variant="outline"
                      className="text-custom-gray font-normal border-custom-gray-2 rounded-md"
                    >
                      {perfume.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── AI-Powered Insights ───────────────────────────────────────────────
           Four auto-generated recommendation cards in a 2×2 grid.
           Each sub-card's colour reflects its category:
             green  = positive / high demand
             yellow = warning / shortage
             indigo = informational / pattern
             red    = negative / declining
      ─────────────────────────────────────────────────────────────────────── */}
      <Card className="mb-6 border-custom-gray-2">
        <CardHeader>
          <CardTitle className="text-base text-custom-black">
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Automated recommendations based on predictive analysis
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {aiInsights.map((insight) => (
              <div
                key={insight.title}
                className={`${insight.bg} ${insight.border} border rounded-xl p-4`}
              >
                {/* Icon + title on one line */}
                <div className="flex items-center gap-2 mb-1">
                  <insight.Icon size={15} className={insight.iconColor} />
                  <span className="font-semibold text-sm text-custom-black">
                    {insight.title}
                  </span>
                </div>
                {/* Description indented to align with the title text */}
                <p className="text-custom-gray text-xs pl-5.75">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ForecastPage;
