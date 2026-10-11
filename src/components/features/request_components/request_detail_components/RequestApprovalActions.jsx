import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canUserApproveRequest } from "@/utils/requestAuthorizationUtils";
import { Check, X } from "lucide-react";

export const RequestApprovalActions = ({ user, allProductsApproved, remarks, setRemarks, handleApproveRequest, handleRejectRequest, selectedRequest }) => {

    const isAuthorized = canUserApproveRequest(user, selectedRequest);

    const { approvals = [] } = selectedRequest;

    const currentPending = approvals.find((a) => a.status === "PENDING");
    const lastApproval = approvals.length > 0 ? approvals[approvals.length - 1] : null;
    
    const requestStage = currentPending?.stage || lastApproval?.stage;
    const requestStatus = selectedRequest.requestStatus;
    const requestId = selectedRequest.requestId;


    if (requestStage === "DISPATCH" || requestStage === "TRANSIT") {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-gray-900">No Action Required</h2>
                <p className="text-sm text-gray-500">
                    This request is currently in the <span className="font-bold text-gray-700">{requestStage}</span> stage. No approval or rejection actions are required at this time.
                </p>
            </div>
        );
    }

    if (requestStatus === "RECEIVED" || requestStatus === "APPROVED") {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-gray-900">No Action Required</h2>
                <p className="text-sm text-gray-500">
                    This request has already been <span className="font-bold text-gray-700">{requestStatus}</span>. No further approval or rejection actions are required.
                </p>
            </div>
        );
    }
    
    if (!isAuthorized) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-gray-900">Waiting for Approval</h2>
                <p className="text-sm text-gray-500">
                    This request is currently pending review for{" "}
                    <span className="font-bold text-gray-700">
                        {requestStage || "the next stage"}
                    </span>
                    . You are not authorized to approve or reject at this time.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm space-y-4">
            <div>
                <h2 className="text-base font-bold text-gray-900">Required Action</h2>
            </div>

            <Textarea
                placeholder="Add remarks (required for rejection)..."
                className="resize-none h-20 text-sm border-gray-200 focus:border-gray-400"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="space-y-2">
                {allProductsApproved && (
                    <Button
                        onClick={() => handleApproveRequest(requestId)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                        <Check className="w-4 h-4 mr-2" /> Approve Request
                    </Button>
                )}
                <Button
                    onClick={() => handleRejectRequest(requestId)}
                    variant="destructive"
                    className="w-full font-bold"
                    disabled={!remarks.trim()}
                >
                    <X className="w-4 h-4 mr-2" /> Reject Request
                </Button>
            </div>
        </div>
    );
}