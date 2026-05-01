import React, { useState, useMemo } from "react";
import { X, Search, LayoutGrid } from "lucide-react";
import ExportModal from "@/components/shared/ExportModal"; // <-- IMPORTANT: Make sure this path matches your folder structure!

const ViewAuditLogsModal = ({ isOpen, onClose, title, data, renderRow }) => {
  // --- STATE FOR FILTERS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUser, setFilterUser] = useState("All");
  const [filterAction, setFilterAction] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --- STATE FOR EXPORT MODAL ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // <-- NEW STATE

  // --- DYNAMIC DROPDOWNS ---
  const uniqueUsers = useMemo(() => {
    const users = new Set(data.map(item => item.user));
    return ["All", ...Array.from(users)];
  }, [data]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(data.map(item => item.action.split(' ')[0]));
    return ["All", ...Array.from(actions)];
  }, [data]);

  // --- FILTER ENGINE ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        item.id.toLowerCase().includes(searchLower) ||
        item.user.toLowerCase().includes(searchLower) ||
        item.action.toLowerCase().includes(searchLower);

      const matchesUser = filterUser === "All" || item.user === filterUser;
      const matchesAction = filterAction === "All" || item.action.startsWith(filterAction);

      const itemDate = new Date(item.timestamp.split(' ')[0]);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      
      const matchesDateFrom = !from || itemDate >= from;
      const matchesDateTo = !to || itemDate <= to;

      return matchesSearch && matchesUser && matchesAction && matchesDateFrom && matchesDateTo;
    });
  }, [data, searchQuery, filterUser, filterAction, dateFrom, dateTo]);

  // --- HANDLERS ---
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterUser("All");
    setFilterAction("All");
    setDateFrom("");
    setDateTo("");
  };

  // <-- NEW EXPORT HANDLER -->
  const handleProcessExport = (exportData) => {
    const { format, dateFrom: exportDateFrom, dateTo: exportDateTo } = exportData;
    console.log(`Exporting ${filteredData.length} rows as ${format}`);
    console.log(`Date Range: ${exportDateFrom} to ${exportDateTo}`);
    
    // Here is where you will eventually call your C# backend to generate the PDF/Excel file
    alert(`Exporting ${filteredData.length} records to ${format}...`);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-montserrat">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          {/* MODAL HEADER */}
          <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 shrink-0">
            <h2 className="text-[28px] font-bold text-[#333] tracking-tight">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <X size={24} />
            </button>
          </div>

          {/* FILTER CONTROLS AREA */}
          <div className="px-6 py-4 space-y-4 border-b border-gray-100 bg-[#F8F9FB]/50 shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gray-500 bg-white"
                />
              </div>

              <select 
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 outline-none w-40 bg-white"
              >
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user === "All" ? "Filter: User" : user}</option>
                ))}
              </select>

              <select 
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 outline-none w-40 bg-white"
              >
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action === "All" ? "Filter: Action" : action}</option>
                ))}
              </select>

              <button 
                onClick={handleClearFilters}
                className="border border-dashed border-[#D47B7B] text-[#D47B7B] px-4 py-2 rounded-md text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <LayoutGrid size={14} className="rotate-45 opacity-0 w-0 hidden" />
                <span className="text-sm leading-none">✕</span> Clear filters
              </button>

              <button 
                onClick={() => setIsExportModalOpen(true)} // <-- UPDATED TO OPEN MODAL
                className="bg-[#E5D5C1] hover:bg-[#d4c2ab] text-[#333] px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm ml-auto"
              >
                <LayoutGrid size={16} /> Export
              </button>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="relative">
                <span className="absolute -top-4 left-0 text-[10px] font-bold text-gray-400 uppercase">Date From:</span>
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 outline-none w-40 bg-white" 
                />
              </div>
              <div className="relative">
                <span className="absolute -top-4 left-0 text-[10px] font-bold text-gray-400 uppercase">Date To:</span>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 outline-none w-40 bg-white" 
                />
              </div>
            </div>
          </div>

          {/* MODAL TABLE */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FB] text-gray-500 font-medium sticky top-0 z-10 shadow-sm border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Log ID</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action done by user</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                        No logs found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => renderRow(item, idx))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-right text-xs text-gray-400 font-medium">
              Showing {filteredData.length} entries
            </div>
          </div>

        </div>
      </div>

      {/* THE NESTED EXPORT MODAL */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleProcessExport} 
      />
    </>
  );
};

export default ViewAuditLogsModal;