const RequestItem = ({ request }) => (
    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
        <div>
            <p className="text-sm font-bold text-foreground">{request?.requestDisplayId || `REQ-${request?.requestId || '000'}`}</p>
            <p className="text-xs text-muted-foreground">{request?.requestedFrom || "Source"} → {request?.deliveredTo || "Destination"}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-600 rounded-md truncate max-w-[120px] inline-block">
                {request?.requestStatus || "Pending"}
            </span>
            <p className="text-xs font-bold text-muted-foreground mt-1">
                {request?.items?.length || 0} Products
            </p>
        </div>
    </div>
);

export default RequestItem;