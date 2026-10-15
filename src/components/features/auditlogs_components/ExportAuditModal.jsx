import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExportAudit } from "@/hooks/audit_hooks/useExportAudit";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const ExportAuditModal = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { exportExcel, exportPdf } = useExportAudit();

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
      if (selectedFormat === 'pdf') {
        await exportPdf(dateFrom, dateTo);
      } else if (selectedFormat === 'xlsx') {
        await exportExcel(dateFrom, dateTo);
      }
      
      onClose(); 
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false); 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center tracking-tight">
            Export To:
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setSelectedFormat('pdf')}
              className={`flex flex-col items-center justify-center p-6 w-32 h-32 rounded-xl border-2 transition-all ${
                selectedFormat === 'pdf' 
                  ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md' 
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
              }`}
            >
              <FileText size={48} className="mb-2" strokeWidth={1.5} />
              <span className="font-bold text-lg tracking-wide">PDF</span>
            </Button>

            <Button 
              variant="outline"
              type="button"
              onClick={() => setSelectedFormat('xlsx')}
              className={`flex flex-col items-center justify-center p-6 w-32 h-32 rounded-xl border-2 transition-all ${
                selectedFormat === 'xlsx' 
                  ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md' 
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
              }`}
            >
              <FileSpreadsheet size={48} className="mb-2" strokeWidth={1.5} />
              <span className="font-bold text-lg tracking-wide">EXCEL</span>
            </Button>

          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Select a date range (optional):</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Date From:</Label>
                <Input
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Date To:</Label>
                <Input
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!selectedFormat || isExporting}
            className="min-w-[140px]"
          >
            {isExporting && <Loader2 size={16} className="animate-spin mr-2" />}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportAuditModal;