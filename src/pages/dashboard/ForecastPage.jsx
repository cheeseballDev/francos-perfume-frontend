import {
  AlertTriangle,
  BarChart2,
  ChevronDown,
  ChevronsUp,
  Eye,
  FileUp,
  TrendingDown,
  TrendingUp,
  Sparkles,
  X,
  Package,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatusCard from "../../components/shared/StatusCard";
import { useForecast } from "@/hooks/forecast_hooks/useForecast";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" }
];
const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear + 1, currentYear + 2];

const aiInsights = [
  { title: "High Demand Expected",       description: "AI detects potential stockout risks based on historical patterns", Icon: TrendingUp,   bg: "bg-emerald-100 dark:bg-emerald-500/10",  border: "border-emerald-200 dark:border-emerald-500/20",  iconColor: "text-emerald-600 dark:text-emerald-400"  },
  { title: "Seasonal Pattern Detected",  description: "Revenue fluctuations align with standard retail holiday cycles",   Icon: Eye,          bg: "bg-blue-100 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", iconColor: "text-blue-600 dark:text-blue-400"   },
];

const ForecastChart = ({ data }) => {
  const W  = 900; const H  = 300;
  const PL = 70;  const PR = 20; const PT = 16; const PB = 36;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  if (!data || data.length === 0) {
      return (
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
              No chart data available. Generate a forecast.
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

const ForecastPage = () => {
  const { forecastData, asyncState, fetchForecast, branchOptions, productOptions } = useForecast();

  const [chartData, setChartData]               = useState([]);
  const [perfumeForecasts, setPerfumeForecasts] = useState([]);
  
  const [formData, setFormData] = useState({
    branchId: "",
    productId: "",
    month: new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2,
    year: new Date().getMonth() + 2 > 12 ? new Date().getFullYear() + 1 : new Date().getFullYear(),
  });

  const handleRefreshForecast = () => {
    if (!formData.branchId || !formData.productId) return;
    fetchForecast({
      year: Number(formData.year),
      month: Number(formData.month), 
      productId: Number(formData.productId),
      branchId: Number(formData.branchId),
      discountPercent: 0,
      discountAmount: 0,
      hasDiscount: false,
      isPercentageDiscount: false,
    });
  };

  // Wire raw API DTO data directly to the UI components with zero frontend calculations
  useEffect(() => {
    if (forecastData) {
      
      // 1. Pass raw revenue DTO to chart
      if (forecastData.revenue) {
        const rev = forecastData.revenue;
        const monthLabel = MONTHS.find(m => m.value === Number(formData.month))?.label.substring(0, 3);
        const yearLabel = String(formData.year).substring(2);
        
        setChartData([
          {
            month: `${monthLabel} '${yearLabel}`,
            value: rev.expectedRevenue,
            upper: rev.highestRevenue,
            lower: rev.lowestRevenue,
            isActual: false
          }
        ]);
      }

      // 2. Pass raw StockForecast DTO properties directly to the list
      if (forecastData.stocks) {
        const st = forecastData.stocks;
        
        setPerfumeForecasts([{
          id: st.productId?.toString() || "1",
          name: st.productName,
          trend: st.recommendedOrderQuantity > 0 ? "up" : "down",
          currentStock: st.currentStock,
          predictedDemand: st.predictedUnitsSold,
          change: st.recommendedOrderQuantity, // Direct mapping from C# model
          confidence: null // No confidence score provided by backend
        }]);
      }
    }
  }, [forecastData, formData.month, formData.year]);

  // Display raw values in metric cards
  const dynamicMetrics = [
    { 
      title: "Expected Revenue", 
      mainValue: forecastData?.revenue ? `₱${forecastData.revenue.expectedRevenue.toLocaleString()}` : "---", 
      subText: "For selected month", 
      Icon: TrendingUp,  
      color: "text-emerald-500"  
    },
    { 
      title: "Predicted Demand", 
      mainValue: forecastData?.stocks ? forecastData.stocks.predictedUnitsSold : "---", 
      subText: "Units expected to sell", 
      Icon: BarChart2,   
      color: "text-blue-500" 
    },
    { 
      title: "Current Inventory", 
      mainValue: forecastData?.stocks ? forecastData.stocks.currentStock : "---", 
      subText: "Units currently on hand", 
      Icon: Package,  
      color: "text-purple-500"   
    },
    { 
      title: "Restock Recommendation", 
      mainValue: forecastData?.stocks ? forecastData.stocks.recommendedOrderQuantity : "---", 
      subText: forecastData?.stocks?.recommendedOrderQuantity > 0 ? "Order required" : "Stock sufficient", 
      Icon: AlertTriangle, 
      color: forecastData?.stocks?.recommendedOrderQuantity > 0 ? "text-amber-500" : "text-emerald-500" 
    },
  ];

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto pr-1 pb-16 font-montserrat animate-fade-in">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-foreground mb-1 leading-none tracking-tight">
          Sales Forecast
        </h1>
        <p className="text-muted-foreground text-sm">
          Predictive analytics and trend analysis for inventory planning
        </p>
      </div>

      {asyncState.isLoading && (
        <div className="mb-6 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary shrink-0">
          Loading forecast data...
        </div>
      )}
      {asyncState.error && (
        <div className="mb-6 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2 shrink-0">
          <AlertTriangle size={13} />
          <span>
            <strong>Forecast API message:</strong> {asyncState.error?.message || "Check network/parameters."}
          </span>
        </div>
      )}

      {/* Forecasting Parameter Card */}
      <Card className="mb-6 border-border bg-card text-card-foreground shadow-sm shrink-0">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-500" size={20} />
            <CardTitle className="text-base text-foreground">AI Forecasting Engine</CardTitle>
          </div>
          <CardDescription>Select parameters to query ML.NET and Gemini AI predictions</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Branch</label>
              <select 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
              >
                <option value="">Select Branch</option>
                {branchOptions?.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Product</label>
              <select 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
              >
                <option value="">Select Product</option>
                {productOptions?.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Month</label>
              <select 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Year</label>
              <select 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <Button
              variant="default"
              onClick={handleRefreshForecast}
              disabled={asyncState.isFetching || !formData.branchId || !formData.productId}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {asyncState.isFetching ? "Analyzing..." : "Generate Forecast"}
            </Button>
          </div>

          {/* Gemini AI Panel */}
          {forecastData?.ai && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fade-in">
              <div className="col-span-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-[-10px]">GEMINI AI PREDICTION</div>
              <div className="bg-background/80 border border-border rounded-lg p-3 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Current Stock</p>
                <p className="text-2xl font-bold text-foreground">{forecastData.ai.currentStock}</p>
              </div>
              <div className="bg-background/80 border border-border rounded-lg p-3 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Predicted Demand</p>
                <p className="text-2xl font-bold text-blue-500">{forecastData.ai.predictedUnitsSold}</p>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Recommended Order</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{forecastData.ai.recommendedOrderQuantity}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 shrink-0">
        {dynamicMetrics.map((card, i) => (
          <StatusCard
            key={i}
            title={card.title}
            mainValue={card.mainValue}
            subText={card.subText}
            Icon={card.Icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Revenue Forecast Chart */}
      <Card className="mb-6 border-border bg-card shadow-sm shrink-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-foreground">
                Revenue Forecast with Confidence Interval
              </CardTitle>
              <CardDescription>
                Live API prediction from ML.NET
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500 text-xs">
              Live API Data
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <ForecastChart data={chartData} />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs text-muted-foreground">
            {[
              { color: "text-muted-foreground", dashed: true,  label: "Upper Bound"     },
              { color: "text-muted-foreground", dashed: true,  label: "Lower Bound"     },
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

      {/* ML.NET Perfume Level Breakdown */}
      <Card className="mb-6 border-border bg-card shadow-sm shrink-0">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-base text-foreground">ML.NET Target Product Forecast</CardTitle>
              <CardDescription>FastTree Regression output for the selected product</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {perfumeForecasts.length === 0 && (
              <div className="text-muted-foreground text-sm py-4">No prediction generated yet.</div>
          )}
          <div className="flex flex-col">
            {perfumeForecasts.map((perfume) => (
              <div key={perfume.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-foreground">{perfume.name}</span>
                  {perfume.trend === "up"
                    ? <TrendingUp  size={15} className="text-emerald-500" />
                    : <TrendingDown size={15} className="text-destructive"  />}
                </div>

                <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-sm pl-4">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Current stock</p>
                    <p className="font-semibold text-foreground text-xl leading-none">{perfume.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Predicted Demand</p>
                    <p className="font-semibold text-foreground text-xl leading-none">{perfume.predictedDemand}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Restock Recommendation</p>
                    <p className={`font-semibold text-xl leading-none ${perfume.change > 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {perfume.change > 0 ? `+${perfume.change}` : perfume.change}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Card */}
      <Card className="mb-6 border-border bg-card shadow-sm shrink-0">
        <CardHeader>
          <CardTitle className="text-base text-foreground">AI-Powered Insights</CardTitle>
          <CardDescription>Automated recommendations based on predictive analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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