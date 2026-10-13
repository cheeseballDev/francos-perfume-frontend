import { formatDateTimeForTable, formatLabel } from "@/utils/formattingUtils";

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
        accessorKey: "salesOrderDisplayId"
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
        render: (row) => {
            return (
                <span className="text-emerald-500">
                    ₱ {Math.abs(row.amount ?? 0).toLocaleString()}
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