import { formatLabel } from "@/utils/formattingUtils";

export const accountColumns = [
    {
        header: "Employee ID",
        accessorKey: "employeeDisplayId"
    },
    {
        header: "Email",
        accessorKey: "email"
    },
    {
        header: "Name",
        render: (row) => `${row.lastName}, ${row.firstName}`
    },
    {
        header: "Branch",
        accessorKey: "branchLocation",
         render: (row) => formatLabel(row.branchLocation) || "N/A"
    },
    {
        header: "Role",
        accessorKey: "employeeRole",
         render: (row) => formatLabel(row.employeeRole) || "N/A"
    },
    {
        header: "Shift",
        accessorKey: "employeeShift",
         render: (row) => formatLabel(row.employeeShift) || "N/A"
    },
    {
        header: "Status",
        accessorKey: "status",
        render: (row) => formatLabel(row.status) || "N/A"
    }
]