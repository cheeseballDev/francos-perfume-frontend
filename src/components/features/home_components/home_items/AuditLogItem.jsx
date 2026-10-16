import { formatDateTimeForTable } from "@/utils/formattingUtils";
import { Archive } from "lucide-react";

const AuditLogItem = ({ log }) => (
    <div className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
        <Archive className="w-5 h-5 text-emerald-500 mt-1" />
        <div>
            <p className="text-sm font-bold text-foreground">{log?.logAction} ({log?.logModule})</p>
            <p className="text-xs text-muted-foreground">By {log?.employeeName} • {formatDateTimeForTable(log?.logTimestamp)}</p>
        </div>
    </div>
);


export default AuditLogItem;