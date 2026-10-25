import { formatDateTimeForTable, formatPeso } from "@/utils/formattingUtils";

const TransactionItem = ({ transaction }) => {
    const amount = Number(transaction?.totalAmount ?? 0);
    const itemCount = transaction?.itemCount ?? transaction?.items?.length ?? 0;

    return (
        <div className="flex justify-between items-center gap-3 p-3 border-b border-border last:border-0">
            <div>
                <p className="text-xs font-bold text-foreground uppercase">ID: {transaction?.salesOrderDisplayId}</p>
                <p className="text-sm text-foreground">
                    {itemCount} {itemCount === 1 ? "item" : "items"} purchased
                </p>
                <p className="text-xs text-muted-foreground">{formatDateTimeForTable(transaction?.salesTimestamp)}</p>
            </div>
            <span className={`text-sm font-bold tabular-nums ${amount < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                {formatPeso(amount)}
            </span>
        </div>
    );
};

export default TransactionItem;
