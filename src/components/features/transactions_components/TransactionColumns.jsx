import { formatDateTimeForTable, formatLabel, formatPeso } from "@/utils/formattingUtils";

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
        className: "text-right",
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
        header: "Processed By",
        accessorKey: "processedBy"
    },
    {
        header: "Location",
        accessorKey: "branchLocation",
         render: (row) => formatLabel(row.branchLocation) || "N/A"
    },
    
]