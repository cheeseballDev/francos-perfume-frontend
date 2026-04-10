import {
  AlertTriangle,
  BarChart2,
  ChevronDown,
  ChevronsUp,
  Eye,
  FileUp,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import StatusCard from "../../components/data_components/StatusCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ═══════════════════════════════════════════════════════════════════════════
   SALES FORECAST — HOW THE DATA WORKS
   ═══════════════════════════════════════════════════════════════════════════

   This page can run in two modes:

   MODE 1 — DEMO DATA (default)
   ─────────────────────────────
   The `DEFAULT_CHART_DATA` and `DEFAULT_PERFUME_FORECASTS` arrays below are
   hardcoded 6-month dummy data. This is what displays out-of-the-box.

   The chart shows:
     • Oct 2024 → Mar 2025: ACTUAL historical sales (isActual: true)
     • Apr 2025 → May 2025: FORECAST predicted sales (isActual: false)

   The dummy numbers are realistic for a small perfume business (₱20k–₱45k/mo).
   They include a December spike (holiday gifting season).

   MODE 2 — CSV IMPORT
   ────────────────────
   The user can upload a .csv file that replaces the demo data with real numbers.

   EXPECTED CSV FORMAT:
   ┌────────────────────────────────────────────────────────────────┐
   │ month,product_name,units_sold,revenue                          │
   │ Oct 2024,Apricot Premium,45,22500                              │
   │ Oct 2024,Rose Classic,30,15000                                 │
   │ Oct 2024,Midnight Wood,20,9500                                 │
   │ Nov 2024,Apricot Premium,52,26000                              │
   │ Nov 2024,Rose Classic,28,14000                                 │
   │ ...                                                            │
   └────────────────────────────────────────────────────────────────┘

   COLUMNS:
     month        — "Mon YYYY" format, e.g. "Oct 2024", "Jan 2025"
     product_name — must match a product in the system (free-text for now)
     units_sold   — integer quantity sold that month
     revenue      — numeric, in Philippine Pesos (no currency symbol)

   WHERE TO PUT THE CSV FILE:
     You do NOT need to put it anywhere on the server.
     It is parsed entirely in the browser using the FileReader API (see parseCSV below).
     The user just clicks "Import CSV" and selects the file from their computer.

   HOW THE CHART UPDATES:
     1. CSV is read as text
     2. parseCSV() splits it into row objects
     3. aggregateByMonth() sums revenue per month → one data point per month
     4. The last row in the file is always treated as "forecast" (isActual: false)
        unless you add an "is_actual" column (see the extension note below)
     5. Confidence bounds are set to ±20% of each value
     6. The chart state is replaced → chart re-renders with real data

   EXTENSION — adding an is_actual column:
     If you want explicit control over which months are actual vs forecast:
       month,product_name,units_sold,revenue,is_actual
       Oct 2024,Apricot Premium,45,22500,true
       Apr 2025,Apricot Premium,60,30000,false

   HOW TO CONNECT TO THE BACKEND INSTEAD:
     Replace the CSV logic with a fetch call to your .NET API:
       GET /api/sales/monthlySummary?months=6
     That endpoint should return the same shape as aggregateByMonth() produces.
   ═══════════════════════════════════════════════════════════════════════════ */


// ── DEFAULT DEMO DATA — 6 months actual + 2 months forecast ─────────────────
//
// value  = total revenue for that month (₱)
// upper  = optimistic scenario (+25%)
// lower  = pessimistic scenario (-20%)
// isActual = true  → historical (solid line, no diamond)
//          = false → forecast   (dashed section, diamond markers)
//
// The December spike is intentional — gift-giving season for perfumes.
const DEFAULT_CHART_DATA = [
  { month: "Oct '24", value: 28500, upper: 35625, lower: 22800, isActual: true  },
  { month: "Nov '24", value: 31200, upper: 39000, lower: 24960, isActual: true  },
  { month: "Dec '24", value: 45800, upper: 57250, lower: 36640, isActual: true  }, // Holiday spike
  { month: "Jan '25", value: 22100, upper: 27625, lower: 17680, isActual: true  }, // Post-holiday dip
  { month: "Feb '25", value: 27400, upper: 34250, lower: 21920, isActual: true  }, // Valentine's bump
  { month: "Mar '25", value: 31000, upper: 38750, lower: 24800, isActual: true  },
  { month: "Apr '25", value: 34200, upper: 42750, lower: 27360, isActual: false }, // Forecast begins
  { month: "May '25", value: 37800, upper: 47250, lower: 30240, isActual: false },
];

// Per-perfume breakdown used in the "Perfume-Level Forecast" card.
// change = predictedDemand - currentStock
//   positive → need to reorder
//   negative → potential overstock
const DEFAULT_PERFUME_FORECASTS = [
  { id: "01", name: "Apricot Premium", trend: "up",   currentStock: 123, predictedDemand: 250, change:  127, confidence: 77 },
  { id: "02", name: "Rose Classic",    trend: "down", currentStock: 200, predictedDemand: 150, change: -100, confidence: 77 },
  { id: "03", name: "Midnight Wood",   trend: "up",   currentStock:  80, predictedDemand: 180, change:  100, confidence: 65 },
  { id: "04", name: "Ocean Breeze",    trend: "up",   currentStock: 150, predictedDemand: 200, change:   50, confidence: 82 },
  { id: "05", name: "Velvet Rose",     trend: "down", currentStock: 300, predictedDemand: 100, change: -200, confidence: 71 },
];

// Metric summary cards — top row
const DEFAULT_METRIC_CARDS = [
  { title: "Forecast Accuracy",       mainValue: "69.67%", secondValue: "+12%",            subText: " from last period", Icon: TrendingUp,  color: "text-custom-green"  },
  { title: "Predicted Growth",        mainValue: "+18.42%",                                subText: "Expected over 6 months", Icon: BarChart2,   color: "text-custom-purple" },
  { title: "High Confidence Items",   mainValue: 12,        secondValue: "87%",            subText: " prediction accuracy",   Icon: ChevronsUp,  color: "text-custom-blue"   },
  { title: "Restock Alerts",          mainValue: 3,         secondValue: "Requires attention",                             Icon: AlertTriangle, color: "text-custom-yellow" },
];

const aiInsights = [
  { title: "High Demand Expected",       description: "Apricot Perfume expected to increase by 12% in 2 months", Icon: TrendingUp,   bg: "bg-green-50",  border: "border-green-100",  iconColor: "text-custom-green"  },
  { title: "Stock Level Shortage Warning", description: "Apricot Perfume may run out of stock by May",          Icon: AlertTriangle, bg: "bg-yellow-50", border: "border-yellow-100", iconColor: "text-custom-yellow" },
  { title: "Pattern Detected",            description: "Rose Classic shows 15% increase during spring months",   Icon: Eye,          bg: "bg-indigo-50", border: "border-indigo-100", iconColor: "text-custom-blue"   },
  { title: "Declining Interest",          description: "Rose Classic showing downward trend",                    Icon: TrendingDown, bg: "bg-red-50",    border: "border-red-100",    iconColor: "text-custom-red"    },
];


/* ─────────────────────────────────────────────────────────────────────────
   CSV PARSING UTILITIES
   ─────────────────────────────────────────────────────────────────────────

   parseCSV(text) → array of row objects
   ───────────────────────────────────────
   Takes a raw CSV string and converts it to an array of plain objects.

   Example input:
     "month,product_name,units_sold,revenue\nOct 2024,Apricot,45,22500"

   Example output:
     [{ month: "Oct 2024", product_name: "Apricot", units_sold: "45", revenue: "22500" }]

   Note: all values come back as strings — convert numbers explicitly below.
   ───────────────────────────────────────────────────────────────────────── */
const parseCSV = (text) => {
  const lines   = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   aggregateByMonth(rows) → chart data array
   ───────────────────────────────────────────
   Groups CSV rows by month, sums the revenue for each month, then builds
   the same shape as DEFAULT_CHART_DATA so the chart component is unchanged.

   Confidence bounds: ±20% of the month's total revenue.
   isActual: all months are "actual" except the very last one in the file,
   which is treated as a forecast period (since you're projecting forward).
   ───────────────────────────────────────────────────────────────────────── */
const aggregateByMonth = (rows) => {
  // Step 1: group revenue by month (sum)
  const monthMap = new Map();
  rows.forEach((row) => {
    const month   = row.month       || "Unknown";
    const revenue = parseFloat(row.revenue) || 0;
    monthMap.set(month, (monthMap.get(month) || 0) + revenue);
  });

  // Step 2: convert Map → sorted array (chronological order is preserved
  // because JS Maps maintain insertion order and CSV rows are chronological)
  const months = Array.from(monthMap.entries());

  return months.map(([month, total], index) => ({
    month,
    value: total,
    upper: Math.round(total * 1.25),  // +25% optimistic bound
    lower: Math.round(total * 0.80),  // −20% pessimistic bound
    isActual: index < months.length - 1, // last month = forecast
  }));
};

/* ─────────────────────────────────────────────────────────────────────────
   extractPerProduct(rows) → perfume forecast array
   ─────────────────────────────────────────────────────────────────────────
   Builds per-product demand summaries from CSV rows.
   Since we don't have real inventory data in the CSV, currentStock is set
   to 0 — replace with a real API call when the backend is connected.
   ───────────────────────────────────────────────────────────────────────── */
const extractPerProduct = (rows) => {
  const productMap = new Map();
  rows.forEach((row) => {
    const name  = row.product_name || "Unknown";
    const units = parseInt(row.units_sold, 10) || 0;
    productMap.set(name, (productMap.get(name) || 0) + units);
  });

  return Array.from(productMap.entries()).map(([name, totalUnits], i) => ({
    id:              String(i + 1).padStart(2, "0"),
    name,
    trend:           totalUnits > 100 ? "up" : "down",
    currentStock:    0,      // 🔌 replace with inventory API data
    predictedDemand: totalUnits,
    change:          totalUnits, // current stock unknown → change = full demand
    confidence:      70,         // placeholder — real model would compute this
  }));
};


/* ─────────────────────────────────────────────────────────────────────────
   ForecastChart — SVG chart component (unchanged from original)
   ─────────────────────────────────────────────────────────────────────────
   Draws:
     1. Y-axis grid + numeric labels
     2. X-axis month labels
     3. Confidence-interval band (filled area between upper and lower bounds)
     4. Smooth Catmull-Rom sales line
     5. Diamond markers on forecast points + the last actual point
   ───────────────────────────────────────────────────────────────────────── */
const ForecastChart = ({ data }) => {
  const W  = 900; const H  = 300;
  const PL = 70;  const PR = 20; const PT = 16; const PB = 36;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  // Dynamic Y max — round up to nearest 10 000 so the scale always fits
  const maxVal  = Math.max(...data.map((d) => d.upper));
  const MAX_Y   = Math.ceil(maxVal / 10000) * 10000 || 60000;
  const Y_TICKS = Array.from({ length: 5 }, (_, i) => Math.round((MAX_Y / 4) * i));

  const n    = data.length;
  const toY  = (val) => PT + (1 - val / MAX_Y) * cH;
  const toX  = (i)   => PL + (i / (n - 1)) * cW;
  const pts  = (acc) => data.map((d, i) => ({ x: toX(i), y: toY(acc(d)) }));

  // Catmull-Rom → cubic Bézier: smooth curve through all points
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

  const upperPts = pts((d) => d.upper);
  const lowerPts = pts((d) => d.lower);
  const bandPath =
    catmullRomPath(upperPts) +
    " L " + lowerPts[lowerPts.length - 1].x + "," + lowerPts[lowerPts.length - 1].y +
    " " + catmullRomPath([...lowerPts].reverse()).replace(/^M [^ ]+ /, "L ") +
    " Z";

  const linePath       = catmullRomPath(pts((d) => d.value));
  const lastActualIdx  = data.reduce((acc, d, i) => (d.isActual ? i : acc), -1);

  // Format y-axis label: ₱28,500 → "₱29k" for large values
  const fmtY = (v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Sales Forecast Chart">
      {Y_TICKS.map((tick) => (
        <g key={tick}>
          <line x1={PL} y1={toY(tick)} x2={W - PR} y2={toY(tick)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={PL - 8} y={toY(tick)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#9ca3af">
            {fmtY(tick)}
          </text>
        </g>
      ))}

      {data.map((d, i) => (
        <text key={d.month} x={toX(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#9ca3af">
          {d.month}
        </text>
      ))}

      {/* Confidence band */}
      <path d={bandPath} fill="#bfdbfe" opacity="0.4" />

      {/* Sales line */}
      <path d={linePath} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Diamond markers on forecast points */}
      {data.filter((d) => !d.isActual).map((d) => {
        const idx = data.indexOf(d);
        const cx = toX(idx); const cy = toY(d.value); const s = 5;
        return <polygon key={d.month} points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`} fill="#0d9488" stroke="white" strokeWidth="1.5" />;
      })}

      {/* Marker at the actual→forecast transition point */}
      {lastActualIdx >= 0 && (() => {
        const cx = toX(lastActualIdx); const cy = toY(data[lastActualIdx].value); const s = 5;
        return <polygon points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`} fill="#0d9488" stroke="white" strokeWidth="1.5" />;
      })()}
    </svg>
  );
};


/* ─────────────────────────────────────────────────────────────────────────
   ForecastPage — Main Page Component
   ───────────────────────────────────────────────────────────────────────── */
const ForecastPage = () => {
  // ── Chart data state — starts with demo data, replaced on CSV import ────
  const [chartData, setChartData]               = useState(DEFAULT_CHART_DATA);
  const [perfumeForecasts, setPerfumeForecasts] = useState(DEFAULT_PERFUME_FORECASTS);
  const [showAll, setShowAll]                   = useState(false);

  // ── CSV import state ────────────────────────────────────────────────────
  // importedFile = the File object the user selected (null = none yet)
  const [importedFile, setImportedFile]   = useState(null);
  // parseError = string shown if the CSV has the wrong format
  const [parseError, setParseError]       = useState(null);
  // isUsingDemo = true when showing default data, false after CSV import
  const [isUsingDemo, setIsUsingDemo]     = useState(true);
  // csvSummary = { months: N, rows: N, products: N } shown after import
  const [csvSummary, setCsvSummary]       = useState(null);

  // Hidden <input type="file"> — triggered programmatically by the button
  const fileInputRef = useRef(null);

  const visiblePerfumes = showAll ? perfumeForecasts : perfumeForecasts.slice(0, 2);

  // ── CSV import handler ───────────────────────────────────────────────────
  // This is the key function — it runs entirely in the browser, no server needed.
  //
  // Flow:
  //   1. FileReader reads the file as plain text
  //   2. parseCSV() turns text → array of row objects
  //   3. Validate that required columns exist
  //   4. aggregateByMonth() groups rows → chart data points
  //   5. extractPerProduct() builds per-perfume forecast cards
  //   6. Replace state → chart re-renders with real data
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);

    const reader = new FileReader();

    // onload fires when FileReader has read the file
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);

        // ── Basic validation ────────────────────────────────────────────
        if (rows.length === 0) throw new Error("CSV file is empty");

        const requiredCols = ["month", "product_name", "units_sold", "revenue"];
        const missingCols  = requiredCols.filter((col) => !(col in rows[0]));
        if (missingCols.length > 0)
          throw new Error(`Missing columns: ${missingCols.join(", ")}`);

        // ── Aggregate and update chart ──────────────────────────────────
        const newChartData      = aggregateByMonth(rows);
        const newPerfumes       = extractPerProduct(rows);
        const uniqueMonths      = new Set(rows.map((r) => r.month)).size;
        const uniqueProducts    = new Set(rows.map((r) => r.product_name)).size;

        setChartData(newChartData);
        setPerfumeForecasts(newPerfumes);
        setImportedFile(file);
        setIsUsingDemo(false);
        setCsvSummary({ months: uniqueMonths, rows: rows.length, products: uniqueProducts });

      } catch (err) {
        setParseError(err.message);
        // Reset the file input so the same file can be re-selected after fixing
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file); // triggers the onload callback above
  };

  // ── Clear imported CSV, revert to demo data ─────────────────────────────
  const handleClearImport = () => {
    setChartData(DEFAULT_CHART_DATA);
    setPerfumeForecasts(DEFAULT_PERFUME_FORECASTS);
    setImportedFile(null);
    setIsUsingDemo(true);
    setCsvSummary(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <h1 className="text-[32px] font-bold text-custom-black mb-2 leading-none tracking-tight">
        Sales Forecast
      </h1>
      <p className="text-custom-gray text-sm mb-8">
        Predictive analytics and trend analysis for inventory planning
      </p>

      {/* ── DATA SOURCE CARD ────────────────────────────────────────────────── */}
      {/*
        This card is the CSV import entry point.
        It shows which data mode is active and lets the user switch between them.

        The hidden <input type="file"> is the actual file picker.
        The visible <Button> just calls fileInputRef.current.click() to open it.
        This pattern gives full control over the button's appearance.
      */}
      <Card className="mb-6 border-custom-gray-2">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* Left: data source status */}
            <div className="flex items-center gap-3">
              <FileUp size={18} className={isUsingDemo ? "text-custom-gray" : "text-custom-green"} />
              <div>
                <p className="text-sm font-semibold text-custom-black leading-none mb-0.5">
                  {isUsingDemo ? "Using sample data" : `Loaded: ${importedFile?.name}`}
                </p>
                {isUsingDemo ? (
                  <p className="text-xs text-custom-gray">
                    Import a CSV file to visualize your real sales data
                  </p>
                ) : (
                  <p className="text-xs text-custom-green">
                    {csvSummary?.rows} rows · {csvSummary?.months} months · {csvSummary?.products} products
                  </p>
                )}
              </div>
            </div>

            {/* Right: action buttons + hidden file input */}
            <div className="flex items-center gap-3">
              {/* Show the CSV format hint inline */}
              <div className="hidden lg:block text-xs text-custom-gray border border-custom-gray-2 rounded-lg px-3 py-2 font-mono">
                {/* Quick reference for the required column format */}
                month, product_name, units_sold, revenue
              </div>

              {/* Hidden native file input — only accepts .csv files */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* "Import CSV" button — programmatically clicks the hidden input */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-custom-gray-2 text-custom-gray hover:text-custom-black gap-2"
              >
                <FileUp size={14} />
                Import CSV
              </Button>

              {/* Clear button — only visible when a CSV is loaded */}
              {!isUsingDemo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearImport}
                  className="text-custom-red hover:text-custom-red/80 gap-1"
                >
                  <X size={14} />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Parse error banner */}
          {parseError && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-custom-red flex items-center gap-2">
              <AlertTriangle size={13} />
              <span>
                <strong>CSV error:</strong> {parseError}. Check that your file has the columns:{" "}
                <code className="font-mono">month, product_name, units_sold, revenue</code>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── METRIC SUMMARY CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-6">
        {DEFAULT_METRIC_CARDS.map((card, i) => (
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

      {/* ── SALES FORECAST CHART ────────────────────────────────────────────── */}
      <Card className="mb-6 border-custom-gray-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-custom-black">
                Sales Forecast with Confidence Interval
              </CardTitle>
              <CardDescription>
                {isUsingDemo
                  ? "Oct 2024 – Mar 2025 actual · Apr – May 2025 forecast (sample data)"
                  : `${importedFile?.name} — ${csvSummary?.months} months, last period is forecast`}
              </CardDescription>
            </div>

            {/* Demo data badge — disappears when real CSV is loaded */}
            {isUsingDemo && (
              <Badge variant="outline" className="text-custom-yellow border-custom-yellow text-xs">
                Sample Data
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ForecastChart data={chartData} />

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3 text-xs text-custom-gray">
            {[
              { color: "#9ca3af", dashed: true,  label: "Upper Bound"     },
              { color: "#9ca3af", dashed: true,  label: "Lower Bound"     },
              { color: "#0d9488", dashed: false, label: "Actual Sales"    },
              { color: "#0d9488", dashed: true,  label: "Predicted Sales" },
            ].map(({ color, dashed, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <svg width="24" height="8" aria-hidden="true">
                  <line x1="0" y1="4" x2="24" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4 3" : undefined} />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── PERFUME-LEVEL FORECAST ───────────────────────────────────────────── */}
      <Card className="mb-6 border-custom-gray-2">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-base text-custom-black">Perfume-Level Forecast</CardTitle>
              <CardDescription>Individual perfume predictions with confidence levels</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-custom-black hover:text-custom-gray gap-1.5 shrink-0"
            >
              {showAll ? "Show Less" : "View All"}
              <ChevronDown size={14} className={`transition-transform duration-200 ${showAll ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="flex flex-col">
            {visiblePerfumes.map((perfume, i) => (
              <div key={perfume.id}>
                {i > 0 && <Separator className="my-4 bg-custom-gray-2" />}

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-custom-black">{perfume.name}</span>
                  {perfume.trend === "up"
                    ? <TrendingUp  size={15} className="text-custom-green" />
                    : <TrendingDown size={15} className="text-custom-red"  />}
                </div>

                <div className="flex items-center gap-10 text-sm pl-4">
                  <div>
                    <p className="text-custom-gray text-xs mb-0.5">Current stock</p>
                    <p className="font-semibold text-custom-black text-xl leading-none">{perfume.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-custom-gray text-xs mb-0.5">Predicted Demand</p>
                    <p className="font-semibold text-custom-black text-xl leading-none">{perfume.predictedDemand}</p>
                  </div>
                  <div>
                    <p className="text-custom-gray text-xs mb-0.5">Change</p>
                    <p className={`font-semibold text-xl leading-none ${perfume.change >= 0 ? "text-custom-green" : "text-custom-red"}`}>
                      {perfume.change >= 0 ? `+${perfume.change}` : perfume.change}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-custom-gray font-normal border-custom-gray-2 rounded-md">
                      {perfume.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── AI-POWERED INSIGHTS ─────────────────────────────────────────────── */}
      <Card className="mb-6 border-custom-gray-2">
        <CardHeader>
          <CardTitle className="text-base text-custom-black">AI-Powered Insights</CardTitle>
          <CardDescription>Automated recommendations based on predictive analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {aiInsights.map((insight) => (
              <div key={insight.title} className={`${insight.bg} ${insight.border} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <insight.Icon size={15} className={insight.iconColor} />
                  <span className="font-semibold text-sm text-custom-black">{insight.title}</span>
                </div>
                <p className="text-custom-gray text-xs pl-5.75">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ForecastPage;
