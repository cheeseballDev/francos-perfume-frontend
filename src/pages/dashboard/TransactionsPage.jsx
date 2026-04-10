import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "../../components/shared/SearchBar";
import { getAllSales } from "../../services/SalesService";

/*
  TransactionsPage
  ─────────────────────────────────────────────────────────────────────────────
  DATA FLOW:
    Mount / refresh → getAllSales() → GET /api/sales/displayAll
    Server returns all sales for the caller's branch, newest first.

  API ROW SHAPE:
    {
      sales_id, sales_display_id, sales_total, sales_payment_method,
      sales_timestamp, employeeFullName,
      soldItems: [{ product_name, sold_qty, sales_price }]
    }

  DETAILS COLUMN:
    Built from soldItems array:
      "Sale: 2× Apricot Premium, 1× Rose Classic"
    If soldItems is empty (no items linked yet), falls back to "Sale".

  NOTE — Restocks:
    Restocks (inventory additions) are tracked via the RequestsController +
    AuditLogController, not as sales. This page shows ONLY point-of-sale
    transactions from salestable. To show restocks here, you'd need to merge
    the audit log or request data into this view.
  ─────────────────────────────────────────────────────────────────────────────
*/

// Builds the human-readable "details" string from the soldItems array
const buildDetails = (soldItems = []) => {
  if (!soldItems.length) return "Sale";
  return "Sale: " + soldItems
    .map((si) => `${si.sold_qty}× ${si.product_name}`)
    .join(", ");
};

// Maps the API sale record to the shape the table expects
const normalizeSale = (sale) => ({
  id:          sale.sales_display_id,
  details:     buildDetails(sale.soldItems),
  processedBy: sale.employeeFullName ?? "—",
  amount:      sale.sales_total,
  method:      sale.sales_payment_method,
  type:        "Sale",
  time:        sale.sales_timestamp
                 ? new Date(sale.sales_timestamp).toLocaleTimeString("en-PH", {
                     hour: "2-digit", minute: "2-digit",
                   })
                 : "—",
  date:        sale.sales_timestamp
                 ? new Date(sale.sales_timestamp).toLocaleDateString("en-PH")
                 : "—",
});

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters]         = useState({
    type: "All", processedBy: "All", dateFrom: "", dateTo: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllSales();
      setTransactions(data.map(normalizeSale));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredData = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch    = t.id.toLowerCase().includes(q) || t.processedBy.toLowerCase().includes(q);
    const matchesType      = filters.type        === "All" || t.type        === filters.type;
    const matchesStaff     = filters.processedBy === "All" || t.processedBy === filters.processedBy;
    const matchesDateFrom  = !filters.dateFrom || new Date(t.date) >= new Date(filters.dateFrom);
    const matchesDateTo    = !filters.dateTo   || new Date(t.date) <= new Date(filters.dateTo);
    return matchesSearch && matchesType && matchesStaff && matchesDateFrom && matchesDateTo;
  });

  const totalPages   = Math.ceil(filteredData.length / itemsPerPage);
  const currentData  = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClearFilters = () => {
    setFilters({ type: "All", processedBy: "All", dateFrom: "", dateTo: "" });
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <h1 className="text-[32px] font-bold text-custom-black tracking-tight leading-none">
            Transaction History
          </h1>
          <p className="text-custom-gray text-sm mt-1">Review all point-of-sale transactions</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchSales}
          disabled={isLoading}
          className="border-custom-gray-2 text-custom-gray hover:text-custom-black gap-2"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 my-8 bg-white p-4 rounded-xl border border-custom-gray-2">
        <div className="flex-1 min-w-52">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target ? e.target.value : e)}
            placeholder="Search transaction ID or staff name…"
          />
        </div>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border border-custom-gray-2 rounded-md px-3 py-2 text-sm text-custom-gray outline-none"
        >
          <option value="All">All Types</option>
          <option value="Sale">Sales Only</option>
        </select>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute -top-4 left-0 text-[10px] text-custom-gray">Date From:</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="border border-custom-gray-2 rounded-md px-2 py-1.5 text-sm text-custom-gray"
            />
          </div>
          <div className="relative">
            <span className="absolute -top-4 left-0 text-[10px] text-custom-gray">Date To:</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="border border-custom-gray-2 rounded-md px-2 py-1.5 text-sm text-custom-gray"
            />
          </div>
        </div>

        <button
          onClick={handleClearFilters}
          className="border border-dashed border-custom-red text-custom-red px-3 py-2 rounded-md text-xs font-bold hover:bg-red-50 transition-colors"
        >
          ✕ Clear filters
        </button>
      </div>

      {/* ── ERROR BANNER ────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-custom-red">
          {error} — <button onClick={fetchSales} className="underline">retry</button>
        </div>
      )}

      {/* ── TABLE ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-white rounded-lg border border-custom-gray-2">
        <table className="w-full text-sm text-left">
          <thead className="text-custom-gray uppercase text-[11px] border-b border-custom-gray-2">
            <tr>
              <th className="px-6 py-4 font-medium">Transaction ID</th>
              <th className="px-6 py-4 font-medium">Details</th>
              <th className="px-6 py-4 font-medium">Processed By</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Payment</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium text-center">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-custom-gray italic">
                  Loading transactions…
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((t, index) => (
                <tr key={t.id} className={index % 2 === 0 ? "bg-custom-primary/20" : "bg-white"}>
                  <td className="px-6 py-4 text-custom-gray">{t.id}</td>
                  <td className="px-6 py-4 text-custom-black font-medium">{t.details}</td>
                  <td className="px-6 py-4 text-custom-gray">{t.processedBy}</td>
                  <td className={`px-6 py-4 font-bold ${t.amount > 0 ? "text-custom-green" : "text-custom-red"}`}>
                    {t.amount > 0
                      ? `+ ₱${Number(t.amount).toFixed(2)}`
                      : `- ₱${Math.abs(t.amount).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 text-custom-gray">{t.method}</td>
                  <td className="px-6 py-4 text-custom-gray">{t.time}</td>
                  <td className="px-6 py-4 text-custom-gray text-center">{t.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-custom-gray italic">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-custom-gray">
          Showing {currentData.length} of {filteredData.length} entries
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`text-2xl transition-colors ${
              currentPage === 1 ? "text-custom-gray-2 cursor-not-allowed" : "text-custom-gray hover:text-custom-black"
            }`}
          >
            ‹
          </button>
          <span className="text-sm text-custom-gray self-center">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`text-2xl transition-colors ${
              currentPage === totalPages || totalPages === 0
                ? "text-custom-gray-2 cursor-not-allowed"
                : "text-custom-gray hover:text-custom-black"
            }`}
          >
            ›
          </button>
        </div>
      </div>

      {/* Export placeholder */}
      <div className="flex gap-3 mt-4">
        <Button variant="primary" className="gap-2">
          📊 Export
        </Button>
      </div>
    </div>
  );
};

export default TransactionsPage;
