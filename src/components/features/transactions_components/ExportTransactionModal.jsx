import CloseButton from "@/components/shared/CloseButton";
import { useExportReport } from "@/hooks/transaction_hooks/useExportReport";
import { FileOutput, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const ExportTransactionModal = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { exportExcel, exportPdf, isError } = useExportReport();

  // Reset the modal state every time it opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFormat(null);
      setDateFrom("");
      setDateTo("");
      setIsExporting(false);
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (!selectedFormat) return;

    setIsExporting(true);
    
    try {
      // Pass the date filters to your hook
      if (selectedFormat === 'pdf') {
        await exportPdf(dateFrom, dateTo);
      } else if (selectedFormat === 'xlsx') {
        await exportExcel(dateFrom, dateTo);
      } else if (selectedFormat === 'csv') {
        // Await exportCsv(dateFrom, dateTo) if you add it to your hook later
      }
      
      onClose(); // Close the modal automatically when done
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false); // Prevents the modal from getting stuck!
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 relative">
        <CloseButton onClick={onClose} />
        
        <h2 className="text-3xl font-bold text-center text-foreground mb-8 tracking-tight">
          Export To:
        </h2>

        {/* FORMAT SELECTION CARDS */}
        <div className="flex justify-center gap-6 mb-8">
          <button 
            onClick={() => setSelectedFormat('pdf')}
            className={`flex flex-col items-center justify-center p-6 w-32 h-32 rounded-xl border-2 transition-all ${
              selectedFormat === 'pdf' 
                ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md' 
                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
            }`}
          >
            <FileText size={56} className="mb-2" strokeWidth={1.5} />
            <span className="font-bold text-xl tracking-wide">PDF</span>
          </button>

          <button 
            onClick={() => setSelectedFormat('xlsx')}
            className={`flex flex-col items-center justify-center p-6 w-32 h-32 rounded-xl border-2 transition-all ${
              selectedFormat === 'xlsx' 
                ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md' 
                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
            }`}
          >
            <FileSpreadsheet size={56} className="mb-2" strokeWidth={1.5} />
            <span className="font-bold text-xl tracking-wide">EXCEL</span>
          </button>

          <button 
            onClick={() => setSelectedFormat('csv')}
            className={`flex flex-col items-center justify-center p-6 w-32 h-32 rounded-xl border-2 transition-all ${
              selectedFormat === 'csv' 
                ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md' 
                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
            }`}
          >
            <FileOutput size={56} className="mb-2" strokeWidth={1.5} />
            <span className="font-bold text-xl tracking-wide">CSV</span>
          </button>
        </div>

        {/* DATE RANGE INPUTS */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">Select a date (optional):</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date From:</p>
              <div className="relative">
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-input bg-transparent rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date To:</p>
              <div className="relative">
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-input bg-transparent rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-center">
          <button 
            onClick={handleExport}
            disabled={!selectedFormat || isExporting}
            className={`bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 min-w-[200px] ${
              !selectedFormat || isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {isExporting && <Loader2 size={16} className="animate-spin" />}
            {isExporting ? "Exporting..." : "Continue to export"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportTransactionModal;