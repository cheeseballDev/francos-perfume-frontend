import { formatDateTimeForTable, formatLabel } from "@/utils/formattingUtils";

export const archivedProductColumns = [
    {
        header: "Product ID",
        accessorKey: "productDisplayId"
    },
    {
        header: "Product Name",
        accessorKey: "productName"
    },
    {
        header: "Date Archived",
        accessorKey: "dateArchived",
        render: (row) => formatDateTimeForTable(row.dateArchived) || "N/A"
    },
    {
        header: "Archived By",
        accessorKey: "archivedBy"
    }
]

export const archivedAccountColumns = [
    {
        header: "Employee ID",
        accessorKey: "employeeDisplayId"
    },
    {
        header: "Branch",
        accessorKey: "branchLocation"
    },
    {
        header: "Email",
        accessorKey: "email"
    },
    {
        header: "Role",
        accessorKey: "employeeRole",
        render: (row) => formatLabel(row.employeeRole) || "N/A"
    },
    {
        header: "Date Archived",
        accessorKey: "dateArchived",
        render: (row) => formatDateTimeForTable(row.dateArchived) || "N/A"
    },
    {
        header: "Archived By",
        accessorKey: "archivedBy"
    }
]