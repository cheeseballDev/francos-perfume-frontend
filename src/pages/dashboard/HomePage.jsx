import { Boxes, Clock, TrendingUpDownIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import StatusCard from "../../components/data_components/StatusCard";
import { getDashboardSummary } from "../../services/SalesService";

/*
  HomePage — Dashboard overview
  ─────────────────────────────────────────────────────────────────────────────
  DATA FLOW:
    useEffect on mount → getDashboardSummary() → GET /api/sales/dashboardSummary
    Server scopes the result to the caller's branch from the JWT.

  SUMMARY SHAPE FROM API:
    {
      totalInventory:    number,   // sum of all product_qty for this branch
      pendingRequests:   number,   // count of PENDING requests
      lowStockCount:     number,   // count of products with qty ≤ threshold
      totalRevenue:      number,   // sum of sales_total (₱), 0 for non-managers
      lowStockThreshold: number    // the threshold used (currently 10)
    }

  LOADING STATE:
    While the API call is in flight, mainValue shows "…" so the cards don't
    flash zeroes before the real data arrives.
  ─────────────────────────────────────────────────────────────────────────────
*/
const DashboardHome = ({ role }) => {
  const isManager = role === "manager";

  // null = loading, object = loaded data
  const [summary, setSummary] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  // Build the cards array from live data.
  // The "…" placeholder keeps the card visible while loading.
  const cards = [
    {
      title:       "Total Inventory",
      mainValue:   summary?.totalInventory  ?? "…",
      subText:     "units across all products",
      Icon:        Boxes,
      color:       "text-custom-green",
      secondValue: summary ? undefined : undefined,
    },
    {
      title:       "Pending Requests",
      mainValue:   summary?.pendingRequests ?? "…",
      subText:     "awaiting action",
      Icon:        Clock,
      color:       "text-custom-blue",
    },
    {
      title:       "Low Stock Perfumes",
      mainValue:   summary?.lowStockCount   ?? "…",
      subText:     summary ? `≤ ${summary.lowStockThreshold} units remaining` : "loading…",
      Icon:        TriangleAlertIcon,
      color:       "text-custom-yellow",
      secondValue: summary?.lowStockCount > 0 ? "Requires Attention" : undefined,
    },
  ];

  // Revenue card is only shown to managers
  if (isManager) {
    cards.push({
      title:     "Total Revenue",
      mainValue: summary
        ? `₱${(summary.totalRevenue / 1000).toFixed(1)}K`
        : "…",
      subText:   "all-time branch revenue",
      Icon:      TrendingUpDownIcon,
      color:     "text-custom-green",
    });
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-[32px] font-bold text-custom-black mb-2 leading-none tracking-tight">
        Dashboard
      </h1>
      <p className="text-custom-gray text-sm mb-8">
        System overview and quick metrics.
      </p>

      {/* API error banner */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-custom-red">
          Could not load dashboard data: {error}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {cards.map((card, index) => (
          <StatusCard
            key={index}
            title={card.title}
            mainValue={card.mainValue}
            subText={card.subText}
            Icon={card.Icon}
            color={card.color}
            secondValue={card.secondValue}
          />
        ))}
      </div>

      {/* Placeholder for future charts/graphs */}
      <div className="h-64 mt-8 border-2 border-dashed border-custom-gray-2 rounded-lg flex items-center justify-center text-custom-gray bg-white">
        Metrics Dashboard — Charts coming soon
      </div>
    </div>
  );
};

export default DashboardHome;
