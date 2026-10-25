import ForecastChart from "@/components/features/forecast_components/ForecastChart";
import SearchableProductSelect from "@/components/shared/SearchableProductSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useForecast } from "@/hooks/forecast_hooks/useForecast";
import {
    AlertTriangle,
    BarChart2,
    Eye,
    Package,
    Sparkles,
    TrendingDown,
    TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import StatusCard from "../../components/shared/StatusCard";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" }
];

const ENGINES = [
    { value: "ML", label: "Standard (ML.NET)"},
    { value: "AI", label: "Third-party (Gemini AI)"}
]

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear + 1, currentYear + 2];

const aiInsights = [
  { title: "High Demand Expected",       description: "AI detects potential stockout risks based on historical patterns", Icon: TrendingUp,   bg: "bg-emerald-100 dark:bg-emerald-500/10",  border: "border-emerald-200 dark:border-emerald-500/20",  iconColor: "text-emerald-600 dark:text-emerald-400"  },
  { title: "Seasonal Pattern Detected",  description: "Revenue fluctuations align with standard retail holiday cycles",   Icon: Eye,          bg: "bg-blue-100 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", iconColor: "text-blue-600 dark:text-blue-400"   },
];

const ForecastPage = () => {
    const { 
        forecastData, 
        asyncState, 
        fetchForecast, 
        branchOptions, 
        productOptions 
    } 
    = useForecast();

    const {
        toast
    } = useToast();

    const [chartData, setChartData] = useState([]);
    const [perfumeForecasts, setPerfumeForecasts] = useState([]);
  
    const [formData, setFormData] = useState({
        branchId: "",
        productId: "",
        month: new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2,
        year: new Date().getMonth() + 2 > 12 ? new Date().getFullYear() + 1 : new Date().getFullYear(),
        engine: "ML",
    });

    const handleRefreshForecast = async () => {
        if (!formData.branchId || !formData.productId) return;

        const result = await fetchForecast({
            year: Number(formData.year),
            month: Number(formData.month),
            productId: Number(formData.productId),
            branchId: Number(formData.branchId),
            engine: formData.engine,
        });

        if (result?.error) {
            toast({
                title: "Generating Forecast Failed",
                description: "",
                variant: "destructive",
                duration: 5000
            });
        }
    };

    const engineLabel = ENGINES.find((en) => en.value === forecastData?.stocksEngine)?.label;

    useEffect(() => {
        if (forecastData) {
            if (!forecastData.revenue) setChartData([]);
            if (!forecastData.stocks) setPerfumeForecasts([]);

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
          change: st.recommendedOrderQuantity,
          confidence: null 
        }]);
      }
    }
  }, [forecastData, formData.month, formData.year]);

    const dynamicMetrics = [
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
          Stock Forecast
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
            <strong>Forecast API message:</strong> Selected forecast engine is unavailable. Please use ML.net
          </span>
        </div>
      )}

      {/* Forecasting Parameter Card */}
      <Card className="mb-6 p-4 border-border bg-card text-card-foreground shadow-sm shrink-0">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-500" size={20} />
            <CardTitle className="text-base text-foreground">AI Forecasting Engine</CardTitle>
          </div>
          <CardDescription>Choose the parameters and the engine (ML.NET or Gemini AI) to generate a forecast</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 items-end mb-4">
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
                <SearchableProductSelect
                    productOptions={productOptions}
                    selectedProduct={formData.productId}
                    setSelectedProduct={(value) => setFormData(prev => ({ ...prev, productId: value }))}
                    placeholder="Select product..."
                />
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

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Forecast engine</label>
                <select
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                    value={formData.engine}
                    onChange={(e) => setFormData((prev) => ({ ...prev, engine: e.target.value }))}
                >
                    {ENGINES.map((en) => <option key={en.value} value={en.value}>{en.label}</option>)}
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

          {forecastData?.stocks && (
            <p className="text-xs text-muted-foreground">
              Stock forecast generated by <span className="font-semibold text-foreground">{engineLabel}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 shrink-0">
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
          <div className="p-4 flex items-center justify-between">
            <div>
              <CardTitle className="mb-2 text-base text-foreground">
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

          <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs text-muted-foreground">
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
      <Card className="p-6 mb-6 border-border bg-card shadow-sm shrink-0">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-base text-foreground">Target Product Forecast</CardTitle>
              <CardDescription>
                {forecastData?.stocksEngine === "AI"
                  ? "Gemini AI output for the selected product"
                  : "ML.NET FastTree regression output for the selected product"}
              </CardDescription>
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
      <Card className="p-6 mb-6 border-border bg-card shadow-sm shrink-0">
        <CardHeader>
          <CardTitle className="text-base text-foreground">AI-Powered Insights</CardTitle>
          <CardDescription className="mb-4">Automated recommendations based on predictive analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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