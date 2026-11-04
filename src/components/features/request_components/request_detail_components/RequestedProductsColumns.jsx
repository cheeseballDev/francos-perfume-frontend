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
            const itemId = row.requestItemId;
            const approvalState = itemApprovals[itemId];

            return (
                <input
                    type="checkbox"
                    checked={approvalState ? approvalState.isApproved : true}
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
            const state = itemApprovals[row.requestItemId];
            const isApproved = state ? state.isApproved : true;
            return (
                <input
                    type="number"
                    min={1}
                    max={row.requestedQty}
                    disabled={!isApproved}
                    value={isApproved ? (state?.approvedQty ?? row.requestedQty) : 0}
                    onChange={(e) => handleQtyChange(row.requestItemId, e.target.value)}
                    className="w-20 px-2 py-1 border border-input bg-transparent text-foreground rounded text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
                />
            );
        },
    },
];