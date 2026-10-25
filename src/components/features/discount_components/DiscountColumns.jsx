import StatusBadge from "@/components/shared/StatusBadge";
import { formatLabel } from "@/utils/formattingUtils";

export const discountColumns = [
    {
        header: 'Prefix',
        accessorKey: 'discountPrefix'
    },
    {
        header: 'Discount Name',
        accessorKey: 'discountName'
    },
    {
        header: 'Type',
        accessorKey: 'discountType',
        render: (row) => formatLabel(row.discountType) || 'N/A'
    },
    {
        id: 'discountValue',
        header: 'Value',
        cellClassName: 'font-medium tabular-nums',
        render: (row) => {
            const { discountPercent, discountAmount, discountType } = row || {};
            if (discountType?.toUpperCase() === 'PERCENTAGE') {
                const percentValue = discountPercent < 1 ? discountPercent * 100 : discountPercent;
                return `${percentValue}%`
            }
            return `₱${Number(discountAmount || 0)}`;
        }
    },
    {
        header: 'Status',
        accessorKey: 'discountStatus',
        render: (row) => <StatusBadge status={row.discountStatus || 'N/A'} />
    }
]