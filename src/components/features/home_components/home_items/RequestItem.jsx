const RequestItem = ({ request }) => (
    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
        <div>
            <p className="text-sm font-bold text-foreground">{request?.requestDisplayId || `REQ-${request?.requestId || '000'}`}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-600 rounded-md truncate max-w-[120px] inline-block">
                {request?.status}
            </span>
        </div>
    </div>
);

export default RequestItem;