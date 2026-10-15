import { formatDateForTable } from "@/utils/formattingUtils";

const TransactionItem = ({ tx }) => (
    <div className="flex justify-between items-center p-3 border-b border-border last:border-0">
        <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">ID: {tx?.transactionDisplayId || tx?.transactionId}</p>
            <p className="text-sm text-foreground">{tx?.items?.length || 0} items purchased</p>
            <p className="text-xs text-muted-foreground">{formatDateForTable(tx?.transactionDate || tx?.createdAt)}</p>
        </div>
        <span className="text-sm font-bold text-emerald-500">+ ₱{Number(tx?.totalAmount || tx?.grandTotal || 0).toLocaleString()}</span>
    </div>
);

export default TransactionItem;