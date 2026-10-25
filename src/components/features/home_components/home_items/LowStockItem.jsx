import { formatDateForTable } from "@/utils/formattingUtils";
import { stockLevel } from "@/utils/statusUtils";
import { AlertCircle } from "lucide-react";

const LowStockItem = ({ item }) => {
    const stock = stockLevel(item?.quantity);

    return (
        <div className="flex justify-between items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/15 rounded-md flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">{item?.productName || "Unknown Product"}</p>
                    <p className="text-xs text-muted-foreground">
                        {item?.branchName || "Branch"} · <span className={`font-semibold ${stock.textClass}`}>{item?.quantity || 0} units left</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">BATCH: {item?.batchCode || "N/A"} • EXP: {formatDateForTable(item?.expiryDate)}</p>
                </div>
            </div>
            {stock.label && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${stock.badgeClass}`}>
                    {stock.label}
                </span>
            )}
        </div>
    );
};

export default LowStockItem;
