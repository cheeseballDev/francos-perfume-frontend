import { formatDateTimeForTable, formatLabel } from "@/utils/formattingUtils";

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
        accessorKey: "logAction"
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