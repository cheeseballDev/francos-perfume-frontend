import { formatDateForTable } from "@/utils/formattingUtils";
import { AlertCircle } from "lucide-react";

const LowStockItem = ({ item }) => (
    <div className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg border border-red-100">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
                <p className="text-sm font-bold text-foreground">{item?.productName || "Unknown Product"}</p>
                <p className="text-xs text-muted-foreground">{item?.branchName || "Branch"} - {item?.quantity || 0} units left</p>
                <p className="text-[10px] text-muted-foreground">BATCH: {item?.batchCode || "N/A"} • EXP: {formatDateForTable(item?.expiryDate)}</p>
            </div>
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/20 text-red-600 rounded-sm text-center">Low Stock</span>
        </div>
    </div>
);


export default LowStockItem;