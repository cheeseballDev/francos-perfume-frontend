import CloseButton from "@/components/shared/CloseButton";
import { useExportReport } from "@/hooks/transaction_hooks/useExportReport";
import { FileOutput, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";


const ExportTransactionModal = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { exportExcel, exportPdf, isError } = useExportReport();

  const handleExport = async () => {
    if (!selectedFormat) return;

    setIsExporting(true);
    if(selectedFormat === 'pdf') {
      exportPdf();
    }

    if(selectedFormat === 'xlsx') {
      exportExcel();
    }
  };

  if (!isOpen) return null;

  return (
    // FIXED: Changed bg-black/50 to bg-black/80 for better dark mode backdrop contrast
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      {/* FIXED: Replaced bg-white with bg-card, added text-card-foreground and border-border */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 relative">
        <CloseButton 
          onClick={onClose}
        />
        {/* CLOSE BUTTON */}
        

        {/* FIXED: Replaced text-[#333] with text-foreground */}
        <h2 className="text-3xl font-bold text-center text-foreground mb-8 tracking-tight">
          Export To:
        </h2>

        {/* FORMAT SELECTION CARDS */}
        <div className="flex justify-center gap-6 mb-8">
          {/* PDF OPTION */}
          <button 
            onClick={() => setSelectedFormat('pdf')}
            className={`flex flex-col items-center justify-center p-6 w-32 h-32 rounded-xl border-2 transition-all ${
              selectedFormat === 'pdf' 
                // FIXED: Replaced gray-800/gray-50 with semantic primary colors
                ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md' 
                // FIXED: Replaced hover:bg-gray-50 with hover:bg-muted and text-muted-foreground
                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
            }`}
          >
            {/* FIXED: Removed text-[#333] to let the parent text color cascade to the icon and text */}
            <FileText size={56} className="mb-2" strokeWidth={1.5} />
            <span className="font-bold text-xl tracking-wide">PDF</span>
          </button>

          {/* EXCEL OPTION */}
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

          {/* CSV OPTION */}
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
          {/* FIXED: Replaced text-gray-500 with text-muted-foreground */}
          <p className="text-sm text-muted-foreground mb-3">Select a date (optional):</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {/* FIXED: Replaced text-gray-400 with text-muted-foreground */}
              <p className="text-xs text-muted-foreground mb-1">Date From:</p>
              <div className="relative">
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  // FIXED: Replaced gray borders and text with semantic input variables
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
            // FIXED: Replaced custom bg-[#E5D5C1] and text-gray-800 with standard primary button classes
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