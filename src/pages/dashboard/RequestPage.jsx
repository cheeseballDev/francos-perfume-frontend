import DataTable from "@/components/data_components/DataTable";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CreateRequestModal from "../../components/features/request_components/CreateRequestModal";
import RequestDetailsModal from "../../components/features/request_components/RequestDetailsModal";
import FilterBar from "../../components/shared/FilterDropDown";
import SearchBar from "../../components/shared/SearchBar";
import { getAllRequests, updateStatus } from "../../services/RequestService";

/*
  RequestPage
  ─────────────────────────────────────────────────────────────────────────────
  DATA FLOW:
    Mount / refresh → getAllRequests() → GET /api/requests/displayAll
    Server returns all requests for the caller's branch, newest first.

  API ROW SHAPE (RequestDisplayDTO):
    {
      requestId, requestDisplayId,
      productId, productDisplayId, productName,
      employeeId, employeeDisplayId, employeeFullName,
      branchId, branchDisplayId, branchLocation,
      requestQty, requestDateSubmitted, requestMessage, requestStatus
    }

  INBOUND vs OUTBOUND:
    The requesttable stores only the requesting branch's branch_id.
    Both tabs currently show the same data (all requests for this branch).
    A true inbound/outbound split requires a target_branch_id column in the DB.
    See RequestsController.cs for the full explanation.

  STATUS UPDATE:
    RequestDetailsModal calls onUpdateStatus(requestId, newStatus).
    This fires PATCH /api/requests/updateStatus/:id and then re-fetches.
  ─────────────────────────────────────────────────────────────────────────────
*/

// Maps API camelCase → short keys used by DataTable columns
const normalizeRequest = (r) => ({
  id:             r.requestDisplayId,
  _numId:         r.requestId,
  perfume:        r.productName      ?? "—",
  qty:            r.requestQty,
  requested_from: r.branchLocation   ?? r.branchDisplayId ?? "—",
  sent_to:        "—",   // not in schema yet — see controller comments
  date_created:   r.requestDateSubmitted
                    ? new Date(r.requestDateSubmitted).toLocaleDateString("en-PH")
                    : "—",
  time:           r.requestDateSubmitted
                    ? new Date(r.requestDateSubmitted).toLocaleTimeString("en-PH", {
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "—",
  status:         r.requestStatus,
  message:        r.requestMessage   ?? "",
  employee:       r.employeeFullName ?? r.employeeDisplayId ?? "—",
});

const filterSelectionsTop = [
  { key: "perfume", label: "All Perfumes", options: ["All Perfumes", "Apricot Spray", "Ocean Breeze", "Midnight Wood", "Citrus Bloom", "Velvet Rose"] },
  { key: "status",  label: "All Statuses", options: ["All Statuses", "PENDING", "DENIED", "CANCELLED", "RECEIVED"] },
];
const filterSelectionsBottom = [
  { key: "requested_from", label: "Requested From", options: ["All Branches", "Sta. Lucia", "Riverbanks"] },
  { key: "sent_to",        label: "Sent To",         options: ["All Branches", "Sta. Lucia", "Riverbanks"] },
];

const RequestPage = () => {
  const [requests, setRequests]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters]         = useState({
    perfume: "All Perfumes", status: "All Statuses", requested_from: "", sent_to: "", date_created: "",
  });
  const [activeTab, setActiveTab] = useState("outbound");

  const [isCreateOpen, setIsCreateOpen]     = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen]   = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllRequests();
      setRequests(data.map(normalizeRequest));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Status update ────────────────────────────────────────────────────────
  const handleUpdateStatus = async (requestId, newStatus) => {
    const numId = requests.find((r) => r.id === requestId)?._numId;
    if (!numId) return;
    try {
      await updateStatus(numId, newStatus);
      fetchRequests();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────
  // CreateRequestModal passes a DTO with { product_id, request_qty, request_message }
  // The service call is made inside the modal's onSave — after save, re-fetch.
  const handleAddRequest = () => {
    setIsCreateOpen(false);
    fetchRequests();
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredData = requests.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch  = item.id.toLowerCase().includes(q) || item.perfume.toLowerCase().includes(q);
    const matchesPerfume = !filters.perfume || filters.perfume === "All Perfumes" || item.perfume === filters.perfume;
    const matchesStatus  = !filters.status  || filters.status  === "All Statuses" || item.status.toLowerCase() === filters.status.toLowerCase();
    const matchesFrom    = !filters.requested_from || filters.requested_from === "All Branches" || item.requested_from === filters.requested_from;
    const formattedDate  = filters.date_created ? filters.date_created.replace(/-/g, "/") : "";
    const matchesDate    = !formattedDate || item.date_created === formattedDate;
    return matchesSearch && matchesPerfume && matchesStatus && matchesFrom && matchesDate;
  });

  const handleClearFilters = () => {
    setFilters({ perfume: "All Perfumes", status: "All Statuses", requested_from: "", sent_to: "", date_created: "" });
    setSearchQuery("");
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    { header: "REQ ID",         accessorKey: "id",             enableSorting: true },
    { header: "Perfume",        accessorKey: "perfume",        enableSorting: true },
    { header: "Quantity",       accessorKey: "qty",            enableSorting: true },
    { header: "Requested From", accessorKey: "requested_from", enableSorting: true },
    { header: "Sent To",        accessorKey: "sent_to",        enableSorting: true },
    { header: "Date Created",   accessorKey: "date_created",   enableSorting: true },
    { header: "Time",           accessorKey: "time",           enableSorting: true },
    { header: "Status",         accessorKey: "status",         enableSorting: true },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setSelectedRequest(item); setIsDetailsOpen(true); }}
          >
            <Eye size={14} /> View Details
          </Button>
        );
      },
    },
  ];

  const pendingCount  = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      <h1 className="text-[32px] font-bold text-custom-black mb-1 leading-none tracking-tight">
        Request
      </h1>
      <p className="text-custom-gray text-sm mb-6">Check requests and confirm</p>

      {/* ── FILTERS ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-4">
          <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e?.target ? e.target.value : e)} />
          <FilterBar filters={filters} setFilters={setFilters} filterSelections={filterSelectionsTop} />
        </div>
        <div className="flex items-center gap-4">
          <FilterBar filters={filters} setFilters={setFilters} filterSelections={filterSelectionsBottom} />
          <div className="relative">
            <span className="absolute -top-4 left-0 text-[10px] text-custom-gray">Date Created:</span>
            <input
              type="date"
              value={filters.date_created}
              onChange={(e) => setFilters({ ...filters, date_created: e.target.value })}
              className="border border-custom-gray-2 rounded-md px-3 py-1.5 text-sm text-custom-gray focus:outline-none focus:ring-1 focus:ring-custom-gray"
            />
          </div>
          <Button variant="outline-destructive" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-custom-black mb-1">Existing Requests</h2>
      <p className="text-custom-gray text-sm mb-4">List of all previous existing requests</p>

      {/* ── ERROR ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-custom-red">
          {error} — <button onClick={fetchRequests} className="underline">retry</button>
        </div>
      )}

      {/* ── TAB BAR + ACTIONS ───────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex bg-custom-gray-2 p-1 rounded-md border border-custom-gray-2">
          <button
            onClick={() => setActiveTab("outbound")}
            className={`px-6 py-1.5 text-sm rounded-sm font-medium transition-colors ${
              activeTab === "outbound" ? "bg-custom-primary text-custom-black shadow-sm" : "text-custom-gray hover:text-custom-black"
            }`}
          >
            Outbound ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("inbound")}
            className={`px-6 py-1.5 text-sm rounded-sm font-medium transition-colors ${
              activeTab === "inbound" ? "bg-custom-primary text-custom-black shadow-sm" : "text-custom-gray hover:text-custom-black"
            }`}
          >
            Inbound
          </button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchRequests}
            disabled={isLoading}
            className="border-custom-gray-2 text-custom-gray hover:text-custom-black"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <span className="text-lg leading-none">+</span> Create a new request
          </Button>
        </div>
      </div>

      {/* ── TABLE ───────────────────────────────────────────────────────── */}
      <DataTable data={filteredData} columns={columns} />

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <RequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        onUpdateStatus={handleUpdateStatus}
      />
      <CreateRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleAddRequest}
      />
    </div>
  );
};

export default RequestPage;
