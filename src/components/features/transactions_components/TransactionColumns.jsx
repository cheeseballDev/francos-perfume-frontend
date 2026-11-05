import { formatDateTimeForTable, formatLabel, formatPeso } from "@/utils/formattingUtils";
import { TONES } from "@/utils/statusUtils";

const TRANSACTION_TYPES = {
    REPLACED: { label: "Replaced", tone: TONES.partial },
    "UPGRADE PAYMENT": { label: "Upgrade payment", tone: TONES.outbound },
};

export const transactionColumns = [
    {
        header: "Date Received",
        accessorKey: "transactionDate",
        render: (row) => {
            return (
                <span>
                    {formatDateTimeForTable(row.transactionDate)}
                </span>
            )
        }
    },
    {
        header: "Sales Order ID",
        accessorKey: "salesOrderDisplayId",
        cellClassName: "font-medium"
    },
    {
        header: "Type",
        render: (row) => {
            const type = TRANSACTION_TYPES[row.transactionType];
            if (!type) return <span className="text-muted-foreground">Sale</span>;
            return (
                <span
                    title={row.replacesSalesOrderDisplayId ? `For ${row.replacesSalesOrderDisplayId}` : undefined}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-semibold whitespace-nowrap ${type.tone}`}
                >
                    {type.label}
                </span>
            );
        },
    },
    {
        header: "Perfume Sold",
        render: (transaction) => {
            const products = transaction.productList;
            return Array.isArray(products) && products.length > 0
                ? products.map((product) => product.productName).join(', ')
                : 'No products'
        },
    },
    {
        header: "Amount",
        cellClassName: "font-semibold tabular-nums",
        render: (row) => {
            const amount = Number(row.amount ?? 0);
            return (
                <span className={amount < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}>
                    {formatPeso(amount)}
                </span>
            )
        }
    },
    {
        header: "Payment Method",
        cellClassName: "font-semibold tabular-nums",
        render: (row) => {
            return (
                <span className="text-foreground">
                    {formatLabel(row.paymentMethod) || "N/A"}
                </span>
            )
        }
    },
    {
        header: "Processed By",
        accessorKey: "processedBy"
    },
    {
        header: "Location",
        accessorKey: "branchLocation",
         render: (row) => formatLabel(row.branchLocation) || "N/A"
    },
    
]