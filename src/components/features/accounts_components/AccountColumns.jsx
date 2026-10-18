import { formatLabel } from "@/utils/formattingUtils";

export const accountColumns = [
    {
        header: "Employee ID",
        accessorKey: "employeeDisplayId",
        className: "text-foreground font-medium"
    },
    {
        header: "Name",
        render: (row) => `${row.lastName}, ${row.firstName}`
    },
    {
        header: "Role",
        accessorKey: "employeeRole",
        render: (row) => formatLabel(row.employeeRole) || "N/A"
    },
    {
        header: "Status",
        accessorKey: "status",
        render: (row) => formatLabel(row.status) || "N/A"
    },
    // HIDDEN ON MOBILE (Below 'md' screens)
    {
        header: "Email",
        accessorKey: "email",
        className: "hidden md:table-cell" // Hides column on small screens
    },
    {
        header: "Branch",
        accessorKey: "branchLocation",
        render: (row) => formatLabel(row.branchLocation) || "N/A",
        className: "hidden lg:table-cell" // Hides column on small/medium screens
    },
    {
        header: "Shift",
        accessorKey: "employeeShift",
        render: (row) => formatLabel(row.employeeShift) || "N/A",
        className: "hidden xl:table-cell" // Hides column unless on large desktop
    }
];