import { formatDateTimeForTable, formatLabel, formatPeso } from "@/utils/formattingUtils";
import { reasonLabel, returnedItemClass, returnedItemLabel } from "./replacementOptions";

export const replacementColumns = [
    {
        header: "Date Replaced",
        accessorKey: "replacedAt",
        render: (row) => <span>{formatDateTimeForTable(row.replacedAt)}</span>,
    },
    {
        header: "Replacement ID",
        accessorKey: "replacementDisplayId",
        cellClassName: "font-medium",
    },
    {
        header: "Sales Order ID",
        accessorKey: "salesOrderDisplayId",
    },
    {
        header: "Returned Perfume",
        render: (row) => (
            <span>
                {row.originalProductName}
                <span className="text-muted-foreground"> ×{row.quantity}</span>
            </span>
        ),
    },
    {
        header: "Replaced With",
        accessorKey: "replacementProductName",
    },
    {
        header: "Reason",
        render: (row) => reasonLabel(row.reason),
    },
    {
        header: "Returned Item",
        render: (row) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-semibold whitespace-nowrap ${returnedItemClass(row.returnedItemAction)}`}>
                {returnedItemLabel(row.returnedItemAction)}
            </span>
        ),
    },
    {
        header: "Paid",
        cellClassName: "font-semibold tabular-nums",
        render: (row) => (Number(row.priceDifference) > 0 ? formatPeso(row.priceDifference) : "—"),
    },
    {
        header: "Processed By",
        accessorKey: "processedBy",
    },
    {
        header: "Location",
        render: (row) => formatLabel(row.branchLocation) || "N/A",
    },
];
