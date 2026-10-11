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
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatusCard from "../../components/shared/StatusCard";
import { useForecast } from "@/hooks/forecast_hooks/useForecast";

const DEFAULT_CHART_DATA = [
  { month: "Oct '24", value: 28500, upper: 35625, lower: 22800, isActual: true  },
  { month: "Nov '24", value: 31200, upper: 39000, lower: 24960, isActual: true  },
  { month: "Dec '24", value: 45800, upper: 57250, lower: 36640, isActual: true  },
  { month: "Jan '25", value: 22100, upper: 27625, lower: 17680, isActual: true  },
  { month: "Feb '25", value: 27400, upper: 34250, lower: 21920, isActual: true  },
  { month: "Mar '25", value: 31000, upper: 38750, lower: 24800, isActual: true  },
  { month: "Apr '25", value: 34200, upper: 42750, lower: 27360, isActual: false },
  { month: "May '25", value: 37800, upper: 47250, lower: 30240, isActual: false },
];

const DEFAULT_PERFUME_FORECASTS = [
  { id: "01", name: "Apricot Premium", trend: "up",   currentStock: 123, predictedDemand: 250, change:  127, confidence: 77 },
  { id: "02", name: "Rose Classic",    trend: "down", currentStock: 200, predictedDemand: 150, change: -100, confidence: 77 },
  { id: "03", name: "Midnight Wood",   trend: "up",   currentStock:  80, predictedDemand: 180, change:  100, confidence: 65 },
  { id: "04", name: "Ocean Breeze",    trend: "up",   currentStock: 150, predictedDemand: 200, change:   50, confidence: 82 },
  { id: "05", name: "Velvet Rose",     trend: "down", currentStock: 300, predictedDemand: 100, change: -200, confidence: 71 },
];

const DEFAULT_METRIC_CARDS = [
  { title: "Forecast Accuracy",       mainValue: "69.67%", secondValue: "+12%",            subText: " from last period", Icon: TrendingUp,  color: "text-emerald-500"  },
  { title: "Predicted Growth",        mainValue: "+18.42%",                                subText: "Expected over 6 months", Icon: BarChart2,   color: "text-purple-500" },
  { title: "High Confidence Items",   mainValue: 12,        secondValue: "87%",            subText: " prediction accuracy",   Icon: ChevronsUp,  color: "text-blue-500"   },
  { title: "Restock Alerts",          mainValue: 3,         secondValue: "Requires attention",                            Icon: AlertTriangle, color: "text-amber-500" },
];

const aiInsights = [
  { title: "High Demand Expected",       description: "Apricot Perfume expected to increase by 12% in 2 months", Icon: TrendingUp,   bg: "bg-emerald-100 dark:bg-emerald-500/10",  border: "border-emerald-200 dark:border-emerald-500/20",  iconColor: "text-emerald-600 dark:text-emerald-400"  },
  { title: "Stock Level Shortage Warning", description: "Apricot Perfume may run out of stock by May",          Icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400" },
  { title: "Pattern Detected",            description: "Rose Classic shows 15% increase during spring months",   Icon: Eye,          bg: "bg-blue-100 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", iconColor: "text-blue-600 dark:text-blue-400"   },
  { title: "Declining Interest",          description: "Rose Classic showing downward trend",                    Icon: TrendingDown, bg: "bg-red-100 dark:bg-red-500/10",    border: "border-red-200 dark:border-red-500/20",    iconColor: "text-red-600 dark:text-red-400"    },
];

const parseCSV = (text) => {
  const lines   = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
};

const aggregateByMonth = (rows) => {
  const monthMap = new Map();
  rows.forEach((row) => {
    const month   = row.month       || "Unknown";
    const revenue = parseFloat(row.revenue) || 0;
    monthMap.set(month, (monthMap.get(month) || 0) + revenue);
  });

  const months = Array.from(monthMap.entries());

  return months.map(([month, total], index) => ({
    month,
    value: total,
    upper: Math.round(total * 1.25),
    lower: Math.round(total * 0.80),
    isActual: index < months.length - 1, 
  }));
};

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
    currentStock:    0,
    predictedDemand: totalUnits,
    change:          totalUnits,
    confidence:      70,
  }));
};

const ForecastChart = ({ data }) => {
  const W  = 900; const H  = 300;
  const PL = 70;  const PR = 20; const PT = 16; const PB = 36;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const maxVal  = Math.max(...data.map((d) => d.upper));
  const MAX_Y   = Math.ceil(maxVal / 10000) * 10000 || 60000;
  const Y_TICKS = Array.from({ length: 5 }, (_, i) => Math.round((MAX_Y / 4) * i));

  const n    = data.length;
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

  const upperPts = pts((d) => d.upper);
  const lowerPts = pts((d) => d.lower);
  const bandPath =
    catmullRomPath(upperPts) +
    " L " + lowerPts[lowerPts.length - 1].x + "," + lowerPts[lowerPts.length - 1].y +
    " " + catmullRomPath([...lowerPts].reverse()).replace(/^M [^ ]+ /, "L ") +
    " Z";

  const linePath       = catmullRomPath(pts((d) => d.value));
  const lastActualIdx  = data.reduce((acc, d, i) => (d.isActual ? i : acc), -1);

  const fmtY = (v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Sales Forecast Chart">
      {Y_TICKS.map((tick) => (
        <g key={tick}>
          <line x1={PL} y1={toY(tick)} x2={W - PR} y2={toY(tick)} stroke="currentColor" className="text-border" strokeWidth="1" />
          <text x={PL - 8} y={toY(tick)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="currentColor" className="text-muted-foreground">
            {fmtY(tick)}
          </text>
        </g>
      ))}

      {data.map((d, i) => (
        <text key={d.month} x={toX(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor" className="text-muted-foreground">
          {d.month}
        </text>
      ))}

      <path d={bandPath} className="fill-primary/20" />

      <path d={linePath} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {data.filter((d) => !d.isActual).map((d) => {
        const idx = data.indexOf(d);
        const cx = toX(idx); const cy = toY(d.value); const s = 5;
        return <polygon key={d.month} points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`} fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="text-primary stroke-background" />;
      })}

      {lastActualIdx >= 0 && (() => {
        const cx = toX(lastActualIdx); const cy = toY(data[lastActualIdx].value); const s = 5;
        return <polygon points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`} fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="text-primary stroke-background" />;
      })()}
    </svg>
  );
};

const ForecastPage = () => {
  const { forecastData, asyncState, fetchForecast } = useForecast();

  const [chartData, setChartData]               = useState(DEFAULT_CHART_DATA);
  const [perfumeForecasts, setPerfumeForecasts] = useState(DEFAULT_PERFUME_FORECASTS);
  const [showAll, setShowAll]                   = useState(false);

  const [importedFile, setImportedFile]   = useState(null);
  const [parseError, setParseError]       = useState(null);
  const [isUsingDemo, setIsUsingDemo]     = useState(true);
  const [csvSummary, setCsvSummary]       = useState(null);

  const fileInputRef = useRef(null);

  const visiblePerfumes = showAll ? perfumeForecasts : perfumeForecasts.slice(0, 2);

  const handleRefreshForecast = () => {
    const now = new Date();
    fetchForecast({
      year: now.getFullYear(),
      month: now.getMonth() + 1, 
      productId: 0,
      discountPercent: 0,
      discountAmount: 0,
      hasDiscount: false,
      isPercentageDiscount: false,
    });
  };

  useEffect(() => {
    const revenue = forecastData?.revenue;
    if (!revenue) return;
    const incoming = Array.isArray(revenue) ? revenue : revenue.data;
    if (Array.isArray(incoming) && incoming.length > 0) {
      setChartData(incoming);
    }
  }, [forecastData]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);

        if (rows.length === 0) throw new Error("CSV file is empty");

        const requiredCols = ["month", "product_name", "units_sold", "revenue"];
        const missingCols  = requiredCols.filter((col) => !(col in rows[0]));
        if (missingCols.length > 0)
          throw new Error(`Missing columns: ${missingCols.join(", ")}`);

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
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file); 
  };

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
      <h1 className="text-[32px] font-bold text-foreground mb-2 leading-none tracking-tight">
        Sales Forecast
      </h1>
      <p className="text-muted-foreground text-sm mb-4">
        Predictive analytics and trend analysis for inventory planning
      </p>

      {asyncState.isLoading && (
        <div className="mb-6 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
          Loading forecast from /api/Forecasting...
        </div>
      )}
      {asyncState.error && (
        <div className="mb-6 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
          <AlertTriangle size={13} />
          <span>
            <strong>Forecast API error:</strong> {asyncState.error?.message || "Unknown error"}.
            Showing sample data below.
          </span>
        </div>
      )}

      <Card className="mb-6 border-border bg-card text-card-foreground">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <FileUp size={18} className={isUsingDemo ? "text-muted-foreground" : "text-primary"} />
              <div>
                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">
                  {isUsingDemo ? "Using sample data" : `Loaded: ${importedFile?.name}`}
                </p>
                {isUsingDemo ? (
                  <p className="text-xs text-muted-foreground">
                    Import a CSV file to visualize your real sales data
                  </p>
                ) : (
                  <p className="text-xs text-primary">
                    {csvSummary?.rows} rows · {csvSummary?.months} months · {csvSummary?.products} products
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-xs text-muted-foreground border border-border rounded-lg px-3 py-2 font-mono">
                month, product_name, units_sold, revenue
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-border text-muted-foreground hover:text-foreground gap-2"
              >
                <FileUp size={14} />
                Import CSV
              </Button>

              {!isUsingDemo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearImport}
                  className="text-destructive hover:text-destructive/80 gap-1"
                >
                  <X size={14} />
                  Clear
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={handleRefreshForecast}
                disabled={asyncState.isFetching}
                className="gap-2"
              >
                Refresh Forecast
              </Button>
            </div>
          </div>

          {parseError && (
            <div className="mt-3 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
              <AlertTriangle size={13} />
              <span>
                <strong>CSV error:</strong> {parseError}. Check that your file has the columns:{" "}
                <code className="font-mono">month, product_name, units_sold, revenue</code>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

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

      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-foreground">
                Sales Forecast with Confidence Interval
              </CardTitle>
              <CardDescription>
                {isUsingDemo
                  ? "Oct 2024 – Mar 2025 actual · Apr – May 2025 forecast (sample data)"
                  : `${importedFile?.name} — ${csvSummary?.months} months, last period is forecast`}
              </CardDescription>
            </div>

            {isUsingDemo && (
              <Badge variant="outline" className="text-amber-500 border-amber-500 text-xs">
                Sample Data
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ForecastChart data={chartData} />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3 text-xs text-muted-foreground">
            {[
              { color: "text-muted-foreground", dashed: true,  label: "Upper Bound"     },
              { color: "text-muted-foreground", dashed: true,  label: "Lower Bound"     },
              { color: "text-primary",          dashed: false, label: "Actual Sales"    },
              { color: "text-primary",          dashed: true,  label: "Predicted Sales" },
            ].map(({ color, dashed, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <svg width="24" height="8" aria-hidden="true">
                  <line x1="0" y1="4" x2="24" y2="4" stroke="currentColor" className={color} strokeWidth="2" strokeDasharray={dashed ? "4 3" : undefined} />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-base text-foreground">Perfume-Level Forecast</CardTitle>
              <CardDescription>Individual perfume predictions with confidence levels</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-foreground hover:text-muted-foreground gap-1.5 shrink-0"
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
                {i > 0 && <Separator className="my-4 bg-border" />}

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-foreground">{perfume.name}</span>
                  {perfume.trend === "up"
                    ? <TrendingUp  size={15} className="text-emerald-500" />
                    : <TrendingDown size={15} className="text-destructive"  />}
                </div>

                <div className="flex items-center gap-10 text-sm pl-4">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Current stock</p>
                    <p className="font-semibold text-foreground text-xl leading-none">{perfume.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Predicted Demand</p>
                    <p className="font-semibold text-foreground text-xl leading-none">{perfume.predictedDemand}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Change</p>
                    <p className={`font-semibold text-xl leading-none ${perfume.change >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {perfume.change >= 0 ? `+${perfume.change}` : perfume.change}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-muted-foreground font-normal border-border rounded-md">
                      {perfume.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground">AI-Powered Insights</CardTitle>
          <CardDescription>Automated recommendations based on predictive analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {aiInsights.map((insight) => (
              <div key={insight.title} className={`${insight.bg} ${insight.border} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <insight.Icon size={15} className={insight.iconColor} />
                  <span className="font-semibold text-sm text-foreground">{insight.title}</span>
                </div>
                <p className="text-muted-foreground text-xs pl-5.75">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ForecastPage;