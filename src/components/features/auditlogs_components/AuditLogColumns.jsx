import { formatDateTimeForTable, formatLabel } from "@/utils/formattingUtils";
import ReferenceText from "@/components/shared/ReferenceText";
import { parseAuditChanges } from "./AuditLogChanges";

export const auditLogColumns = [
    {
        header: "Log ID",
        accessorKey: "logDisplayId"
    },
    {
        header: "Branch",
        accessorKey: "branchLocation",
        render: (row) => formatLabel(row.branchLocation) || "N/A"
    },
    {
        header: "Module",
        accessorKey: "logModule"
    },
    {
        header: "Action",
        accessorKey: "logAction",
        render: (row) => (
            <span className="inline-flex items-center gap-2">
                <ReferenceText text={row.logAction} />
                {parseAuditChanges(row).length > 0 && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                        {parseAuditChanges(row).length} {parseAuditChanges(row).length === 1 ? "change" : "changes"}
                    </span>
                )}
            </span>
        )
    },
    {
        header: "Done By",
        accessorKey: "employeeName"
    },
    {
        header: "Timestamp",
        accessorKey: "logTimestamp",
        render: (row) => formatDateTimeForTable(row.logTimestamp) || "N/A"
    }
]