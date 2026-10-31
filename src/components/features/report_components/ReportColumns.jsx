import { formatPeso } from "@/utils/formattingUtils";

export const reportColumnsRevenue = [
    { 
        key: "rank", 
        header: "#", 
        headerClassName: "w-16 text-center", 
        cellClassName: "w-16 text-center", 
        render: (row) => row.rank 
    },
    { 
        accessorKey: "productName", 
        header: "Product",
        headerClassName: "w-auto",
        cellClassName: "w-auto truncate" 
    },
    { 
        key: "revenue", 
        header: "Revenue", 
        headerClassName: "w-44", 
        cellClassName: "w-44 tabular-nums", 
        render: (r) => formatPeso(r.totalRevenue) 
    },
];

export const reportColumnsUnitsSold = [
    { 
        key: "rank", 
        header: "#", 
        headerClassName: "w-16 text-center", 
        cellClassName: "w-16 text-center", 
        render: (row) => row.rank 
    },
    { 
        accessorKey: "productName", 
        header: "Product",
        headerClassName: "w-auto",
        cellClassName: "w-auto truncate" 
    },
    { 
        key: "units", 
        header: "Units Sold", 
        headerClassName: "w-44 ", 
        cellClassName: "w-44 tabular-nums", 
        render: (r) => r.totalUnitsSold.toLocaleString() 
    },
];