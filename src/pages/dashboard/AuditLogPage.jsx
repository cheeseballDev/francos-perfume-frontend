import { auditLogColumns } from "@/components/features/auditlogs_components/AuditLogColumns";
import AuditLogTableSkeleton from "@/components/loaders/AuditLogTableSkeleton";
import DataTable from "@/components/shared/DataTable";
import { useAuditLog } from "@/hooks/audit_hooks/useAuditLog.js";

const AuditLogPage = () => {
  const { auditLogs, asyncState, pagination, filter,  updateFilter } = useAuditLog();

  return (
    <div className="flex flex-col h-full animate-fade-in font-montserrat pb-8">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">
          A comprehensive record of all system activities, inventory changes, and account modifications.
        </p>
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
    </div>
  );
};

export default AuditLogPage;