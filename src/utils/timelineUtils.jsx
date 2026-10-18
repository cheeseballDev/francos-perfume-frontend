import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react";

export const buildApprovalSteps = (approvals, requestedFrom) => {
    const isWarehousePush = requestedFrom?.toUpperCase() === "WAREHOUSE";

    return (approvals || [])
        .filter(approval => !(isWarehousePush && approval.stage === "FULFILLING MANAGER"))
        .map(approval => {
            let stageName = approval.stage.toLowerCase();
            if (isWarehousePush && approval.stage === "REQUESTING MANAGER") {
                stageName = "receiving manager";
            }
            return {
                title: `${stageName.replace(/\b\w/g, l => l.toUpperCase())} Review`,
                subtitle: approval.approverName
                            ? `${approval.approverName} (${approval.approved})`
                            : "Waiting for approval",
                status: approval.status,
            };
        });
};

export const renderTimelineSubtitle = (stage, status, approverName, approverId, remarks) => {
    if (stage != "DISPATCH" && stage != "TRANSIT") {
        if (status != "PENDING") {
            return `Approved by ${approverName} (${approverId})`;
        }
        return "Waiting for approval";
    }

    if (stage === "DISPATCH" || status === "DISPATCHED") {
        if (status != "PENDING") {
            return `Dispatched by ${approverName} (${approverId})`;
        }
        return `To be dispatched`;
    }

    if (stage === "TRANSIT") {
        if (status === "RECEIVED") {
            return `Received by ${approverName} (${approverId})`;
        }
        return `${remarks}`;
    }
    
    return "Unknown status";
}

export const renderBadgeForRequestTimeline = (status) => {
    switch (status) {
        case "APPROVED":
        case "DISPATCHED":
        case "RECEIVED":
            return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {status}
                </span>
            );
        case "REJECTED":
            return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    {status}
                </span>
            );
        case "IN TRANSIT":
            return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {status}
                </span>
            );
        case "PENDING":
            return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    {status}
                </span>
            );
        default:
            return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    {status || "UNKNOWN"}
                </span>
            );
    }
};

export const renderTimelineIcon = (status) => {
    // FIXED: Replaced bg-white with bg-card to match the dark/light mode background
    switch (status?.toUpperCase()) {
        case "APPROVED":
        case "COMPLETED":
        case "RECEIVED":
            return <CheckCircle2 className="w-6 h-6 text-emerald-600 bg-card rounded-full" />;
        case "DISPATCHED":
            return <Truck className="w-6 h-6 text-blue-600 bg-card rounded-full" />;
        case "REJECTED":
            return <XCircle className="w-6 h-6 text-red-600 bg-card rounded-full" />;
        default:
            return <Clock className="w-6 h-6 text-amber-500 bg-card rounded-full" />;
    }
};