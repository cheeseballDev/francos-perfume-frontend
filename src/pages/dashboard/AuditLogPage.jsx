import { auditLogColumns } from "@/components/features/auditlogs_components/AuditLogColumns";
import AuditLogDetails from "@/components/features/auditlogs_components/AuditLogDetails";
import ExportAuditModal from "@/components/features/auditlogs_components/ExportAuditModal"; // Adjust path if you placed it elsewhere
import AuditLogTableSkeleton from "@/components/loaders/AuditLogTableSkeleton";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useAuditLog } from "@/hooks/audit_hooks/useAuditLog.js";
import { Eye, FileDown } from "lucide-react";
import { useState } from "react";

const AuditLogPage = () => {
  const { 
    auditLogs, 
    asyncState, 
    pagination, 
    filter,  
    updateFilter,
    fetchAuditLogDetails
  } = useAuditLog();
  
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedAuditLog, setSelectedAuditLog] = useState(null);
    const [isAuditLogDetailsModalOpen, setIsAuditLogDetailsModalOpen] = useState(false);

    const handleRowClick = async (row) => {
        if (selectedAuditLog?.logId === row.logId) {
            setSelectedAuditLog(null);
            return;
        }
        setSelectedAuditLog(row);
        const auditLog = await fetchAuditLogDetails(row.logId);
        if (auditLog) {
            setSelectedAuditLog(prev => prev ? { ...prev, ...auditLog }: auditLog);
        }
    }

    return (
        <div className="flex flex-col h-full animate-fade-in font-montserrat pb-8 relative">
            <header className="mb-8 border-b border-border pb-6 flex justify-between items-start gap-4">
                <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground text-sm">
                    A comprehensive record of all system activities, inventory changes, and account modifications.
                </p>
                </div>
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
                    // TODO: Add filters
                    //filter={filter}
                    //updateFilter={updateFilter}
                    selectedItem={selectedAuditLog}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={() => setIsAuditLogDetailsModalOpen(true)}
                />
                )}
            </div>

            <div className="relative flex justify-between gap-6">
                <Button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-2 mt-2"
                >
                    <FileDown className="h-5 w-5"/>
                    Export Logs
                </Button>

                <Button
                    variant={selectedAuditLog ? "default" : "ghost"}
                    disabled={!selectedAuditLog}
                    onClick={() => setIsAuditLogDetailsModalOpen(true)}
                >
                    <Eye className='h-8 w-8'/>
                    View Audit Log
                </Button>
            </div>

        <ExportAuditModal 
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
        />

        <AuditLogDetails
            isOpen={isAuditLogDetailsModalOpen}
            onClose={() => setIsAuditLogDetailsModalOpen(false)}
            selectedAuditLog={selectedAuditLog}
        />
    </div>
  );
};

export default AuditLogPage;