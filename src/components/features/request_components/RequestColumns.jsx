import StatusBadge from "@/components/shared/StatusBadge";
import { normalizeStatus } from "@/utils/statusUtils";

// The backend reports the stage as "APPROVED" once nothing is pending,
// even for rejected or cancelled requests, so show "Closed" for those instead.
const FINISHED_STATUSES = ["REJECTED", "CANCELLED", "DELIVERY CANCELLED"];

export const requestColumns = [
    {
        header: "Request ID",
        accessorKey: "requestDisplayId"
    },
    {
        id: 'route',
        header: 'From → To',
        render: (row) => {
            const { requestedFrom, deliveredTo } = row || {};
            return `${requestedFrom} → ${deliveredTo}`
        }
    },
    {
        id: 'status',
        header: 'Status',
        render: (row) => <StatusBadge status={row?.requestStatus || "N/A"} />
    },
    {
        header: 'Item Count',
        accessorKey: 'itemCount',
        cellClassName: 'tabular-nums'
    },
    {
        header: "Stage",
        render: (row) => {
            const isFinished = FINISHED_STATUSES.includes(normalizeStatus(row?.requestStatus));
            return <StatusBadge status={isFinished ? "CLOSED" : (row?.requestStage || "N/A")} />;
        }
    },
]