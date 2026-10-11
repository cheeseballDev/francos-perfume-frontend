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
                    checked={approvalState?.isApproved ?? false}
                    onChange={(e) => handleApproveToggle(itemId, e.target.checked)}
                    disabled={!isEditable}
                    className="w-5 h-5 border border-gray-300 rounded text-center disabled:bg-gray-100"
                />
            );
        },
    },
    {
        accessorKey: "approvedQty",
        header: "Approved Qty",
        render: (row) => (
            <input
                type="number"
                disabled={!itemApprovals[row.requestItemId]?.isApproved}
                value={itemApprovals[row.requestItemId]?.approvedQty ?? row.requestedQty}
                onChange={(e) => handleQtyChange(row.requestItemId, e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100"
            />
        ),
    },
];