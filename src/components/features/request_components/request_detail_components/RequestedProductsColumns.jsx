export const requestedProductsColumns = ( itemApprovals, handleApproveToggle, handleQtyChange, isEditable ) => 
[
    {
        accessorKey: "productDisplayId",
        header: "ID",
        cell: (row) => row.productDisplayId,
    },
    {
        accessorKey: "productName",
        header: "Perfume Name",
        cell: (row) => row.productName,
    },
    {
        accessorKey: "requestedQty",
        header: "Requested",
        cell: (row) => row.requestedQty,
    },
    {
        accessorKey: "isApproved",
        header: "Approve?",
        render: (row) => {
            
            if (row.itemStatus === "REJECTED") {
                return <span className="text-xs text-muted-foreground">Rejected</span>;
            }

            const itemId = row.requestItemId;
            const approvalState = itemApprovals[itemId];

            return (
                <input
                    type="checkbox"
                    checked={approvalState?.isApproved ?? false}
                    onChange={(e) => handleApproveToggle(itemId, e.target.checked)}
                    disabled={!isEditable}
                    className="w-5 h-5 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
            );
        },
    },
    {
        accessorKey: "approvedQty",
        header: "Approved Qty",
        render: (row) => {
            if (row.itemStatus === "REJECTED") {
                return <span className="text-xs text-muted-foreground">—</span>;
            }

            const approvalState = itemApprovals[row.requestItemId];

            return (
                <input
                    type="number"
                    disabled={!isEditable || !approvalState?.isApproved}
                    value={itemApprovals[row.requestItemId]?.approvedQty ?? row.requestedQty}
                    onChange={(e) => handleQtyChange(row.requestItemId, e.target.value)}
                    className="w-20 px-2 py-1 border border-input bg-transparent text-foreground rounded text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
                />
            );
        },
    },
];