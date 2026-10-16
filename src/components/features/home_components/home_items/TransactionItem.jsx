import { formatDateTimeForTable } from "@/utils/formattingUtils";

const TransactionItem = ({ transaction }) => (
    <div className="flex justify-between items-center p-3 border-b border-border last:border-0">
        <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">ID: {transaction?.salesOrderDisplayId}</p>
            <p className="text-sm text-foreground">{transaction?.items?.length} items purchased</p>
            <p className="text-xs text-muted-foreground">{formatDateTimeForTable(transaction?.salesTimestamp)}</p>
        </div>
        <span className="text-sm font-bold text-emerald-500">+ ₱{Number(transaction?.totalAmount).toLocaleString()}</span>
    </div>
);

export default TransactionItem;