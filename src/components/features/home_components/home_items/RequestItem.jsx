import StatusBadge from "@/components/shared/StatusBadge";

// pendingApprovalsList rows are approvals: `stage` says whose turn it is, `status` is PENDING
const RequestItem = ({ request }) => (
    <div className="flex justify-between items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm font-bold text-foreground">
            {request?.requestDisplayId || `REQ-${request?.requestId || '000'}`}
        </p>
        <StatusBadge status={request?.stage || request?.status || "PENDING"} />
    </div>
);

export default RequestItem;
