import { auditLogColumns } from "@/components/features/auditlogs_components/AuditLogColumns";
import ExportAuditModal from "@/components/features/auditlogs_components/ExportAuditModal"; // Adjust path if you placed it elsewhere
import AuditLogTableSkeleton from "@/components/loaders/AuditLogTableSkeleton";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useAuditLog } from "@/hooks/audit_hooks/useAuditLog.js";
import { FileDown } from "lucide-react";
import { useState } from "react";

const AuditLogPage = () => {
  const { auditLogs, asyncState, pagination, filter,  updateFilter } = useAuditLog();
  
  // State to control the export modal visibility
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full animate-fade-in font-montserrat pb-8 relative">
      <header className="mb-8 border-b border-border pb-6 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">
            A comprehensive record of all system activities, inventory changes, and account modifications.
          </p>
        </div>

        <Button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 mt-2"
        >
            <FileDown className="h-5 w-5"/>
            Export Logs
        </Button>
      </header>
      
      <div className="flex flex-col gap-12">
        {asyncState?.isLoading ? (
          <AuditLogTableSkeleton rowCount={10} />
        ) : (
          <DataTable
            columns={auditLogColumns}
            data={auditLogs}
            keyField="logId"
            asyncState={asyncState}
            pagination={pagination}
            filter={filter}
            updateFilter={updateFilter}
          />
        )}
      </div>

      <ExportAuditModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default AuditLogPage;