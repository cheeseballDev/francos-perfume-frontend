import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canUserApproveRequest } from "@/utils/requestAuthorizationUtils";
import { Check, Truck, X } from "lucide-react";

export const RequestApprovalActions = ({ user, allProductsApproved, anyProductApproved, remarks, setRemarks, handleApproveRequest, handleRejectRequest, selectedRequest, isSubmitting, onViewDelivery }) => {

    const isAuthorized = canUserApproveRequest(user, selectedRequest);

    const { approvals = [] } = selectedRequest;

    const currentPending = approvals.find((a) => a.status === "PENDING");
    const lastApproval = approvals.length > 0 ? approvals[approvals.length - 1] : null;
    
    const requestStage = currentPending?.stage || lastApproval?.stage;
    const requestStatus = selectedRequest.requestStatus;
    const requestId = selectedRequest.requestId;

    const deliveryAction = onViewDelivery ? (
        <Button
            variant="outline"
            className="w-full font-bold"
            onClick={onViewDelivery}
        >
            <Truck className="w-4 h-4 mr-2" /> View Delivery Details
        </Button>
    ) : null;
    
    if (requestStatus === "DELIVERY CANCELLED") {
        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-foreground">No Action Required</h2>
                <p className="text-sm text-muted-foreground">
                    This request's delivery has been <span className="font-bold text-custom-red">cancelled</span>. 
                </p>
                {deliveryAction}
            </div>
        )
    }

    if (requestStatus === "REJECTED" || requestStatus === "CANCELLED" || requestStatus === "NOT RECEIVED") {
        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-foreground">No Action Required</h2>
                <p className="text-sm text-muted-foreground">
                    This request is <span className="font-bold text-custom-red">{requestStatus}</span>. 
                </p>
                {deliveryAction}
            </div>
        );
    }

    if (requestStatus === "PARTIAL") {
        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-foreground">No Action Required</h2>
                <p className="text-sm text-muted-foreground">
                    This request's delivery has been <span className="font-bold text-amber-600">partially completed</span>. 
                </p>
                {deliveryAction}
            </div>
        )
    }


    if (requestStatus === "RECEIVED" || requestStatus === "APPROVED" || requestStatus === "COMPLETED") {
        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-foreground">No Action Required</h2>
                <p className="text-sm text-muted-foreground">
                    This request has already been <span className="font-bold text-custom-green">{requestStatus}</span>. No further approval or rejection actions are required.
                </p>
                {deliveryAction}
            </div>
        );
    }


    if (requestStage === "DISPATCH" || requestStage === "TRANSIT") {
        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-foreground">No Action Required</h2>
                <p className="text-sm text-muted-foreground">
                    This request is currently in the <span className="font-bold text-custom-blue">{requestStage}</span> stage. No approval or rejection actions are required at this time.
                    {deliveryAction
                        ? " Open the delivery to track it, or to dispatch or confirm it."
                        : " Please wait for the delivery and go to the Deliveries page to confirm it."}
                </p>
                {deliveryAction}
            </div>
        );
    }
    
    if (!isAuthorized) {
        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4 text-center">
                <h2 className="text-base font-bold text-foreground">Waiting for Approval</h2>
                <p className="text-sm text-muted-foreground">
                    This request is currently pending review for{" "}
                    <span className="font-bold text-foreground">
                        {requestStage || "the next stage"}
                    </span>
                    . You are not authorized to approve or reject at this time.
                </p>
                {deliveryAction}
            </div>
        );
    }

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div>
                <h2 className="text-base font-bold text-foreground">Required Action</h2>
            </div>

            <Textarea
                placeholder="Add remarks (required for rejection)..."
                className="resize-none h-20 text-sm border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="space-y-2">
                {anyProductApproved && (
                    <Button
                        onClick={() => handleApproveRequest(requestId)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {allProductsApproved ? "Approve Request" : "Approve Ticked Items Only"}
                    </Button>
                )}
                <Button
                    onClick={() => handleRejectRequest(requestId)}
                    variant="destructive"
                    className="w-full font-bold"
                    disabled={!remarks.trim() || isSubmitting}
                >
                    <X className="w-4 h-4 mr-2" /> Reject Request
                </Button>
            </div>
        </div>
    );
}