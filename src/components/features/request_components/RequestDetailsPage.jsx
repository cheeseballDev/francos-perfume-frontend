import { useAuth } from "@/auth/UseAuth";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useRequestDetails } from "@/hooks/request_hooks/useRequestDetails";
import { approveRequest, cancelRequest, rejectRequest } from "@/services/RequestService";
import { canUserApproveRequest } from "@/utils/requestAuthorizationUtils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RequestApprovalActions } from "./request_detail_components/RequestApprovalActions";
import RequestInformation from "./request_detail_components/RequestInformation";
import RequestTimeline from "./request_detail_components/RequestTimeline";
import { requestedProductsColumns } from "./request_detail_components/RequestedProductsColumns";

export default function RequestDetailsPage() {

    const { user } = useAuth();

    const { requestId } = useParams();
    const navigate = useNavigate();
    const [requestPayload, setRequestPayload] = useState({});
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [config, setConfig] = useState(null);

    const { selectedRequest, itemApprovals, setItemApprovals } = useRequestDetails(requestId);

    const data = selectedRequest?.data || {};

    const handleApproveToggle = (requestItemId, isApproved) => {
        setItemApprovals((prev) => {
            const requestedQty = data.items?.find((item) => item.requestItemId === requestItemId)?.requestedQty || 0;

            return {
                ...prev,
                [requestItemId]: {
                    ...prev[requestItemId],
                    isApproved,
                    approvedQty: isApproved ? (prev[requestItemId]?.approvedQty || requestedQty) : 0,
                },
            };
        });
    };

    const handleQtyChange = (requestItemId, approvedQty) => {
        const requestedQty = data.items.find(
            item => item.requestItemId === requestItemId
        ).requestedQty || 0;

        const maximumQtyAllowed = Math.min(approvedQty, requestedQty);
    
        setItemApprovals((prev) => ({
                ...prev,
                [requestItemId]: { 
                    ...prev[requestItemId]  , 
                    approvedQty: maximumQtyAllowed,
                    isApproved: maximumQtyAllowed > 0
                },
            }));
    };
    
    const allProductsApproved = Object.values(itemApprovals).length > 0 && 
    Object.values(itemApprovals).every((item) => item.isApproved);

    const isPending = data.requestStatus === "PENDING";

    const handleRejectRequest = async () => {
        if (!remarks.trim()) return;
        setIsSubmitting(true);
        try {
            await rejectRequest(requestId, remarks);
            navigate(0);
        } catch (err) {
            console.error("Failed to reject request:", err);
            setConfig({
                isAlert: true,
                title: "Action Failed",
                description: err.message || "Failed to reject the request.",
                confirmVariant: "destructive",
                confirmText: "Acknowledge",
                onConfirm: () => setConfig(null) 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproveRequest = async () => {
        setIsSubmitting(true);
        try {

            const payload = (data.items || []).map((item) => {
            const approvalState = itemApprovals[item.requestItemId];
            return {
                    remarks: remarks || "N/A",
                    productId: item.productId,
                    requestedItemId: item.requestItemId,
                    isApproved: approvalState?.isApproved ?? true,
                    requestedItemQty: approvalState?.isApproved 
                        ? (approvalState?.approvedQty ?? item.requestedQty) 
                        : 0,
                };
            });
            console.log(payload);
            await approveRequest(requestId, payload);
            navigate(0);
        } catch (err) {
            console.error("Failed to approve request:", err);
            setConfig({
                isAlert: true,
                title: "Action Failed",
                description: err.message || "Failed to approve the request.",
                confirmVariant: "destructive",
                confirmText: "Acknowledge",
                onConfirm: () => setConfig(null) 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelRequest = async () => {
        setIsSubmitting(true);
        try {
            await cancelRequest(requestId);
            navigate("/home/requests");
        } catch (err) {
            console.error("Failed to cancel request:", err);
            setConfig({
                isAlert: true,
                title: "Action Failed",
                description: err.message || "Failed to cancel the request.",
                confirmVariant: "destructive",
                confirmText: "Acknowledge",
                onConfirm: () => setConfig(null) 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedRequest) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center min-h-screen p-6 font-montserrat text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                Loading request details...
            </div>
        );
    }

    const isEditable = canUserApproveRequest(user, { ...data });

    return (
        <div className="p-6 min-h-screen font-montserrat">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/home/requests")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground">
                        {selectedRequest.requestDisplayId}
                    </h1>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full uppercase">
                        {data.requestDirection}
                    </span>
                </div>

                {isPending && (
                    <Button 
                        variant="destructive" 
                        onClick={() => handleCancelRequest(requestId)}
                    >
                        Cancel Request
                    </Button>
                )}
            </div>

            {/* FIXED: Changed breakpoints from lg to xl to force stacking on smaller screens */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">

                    <RequestInformation 
                        request={data} 
                    />

                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Requested Products</h2>
                        <DataTable
                            columns={requestedProductsColumns(
                                itemApprovals, 
                                handleApproveToggle, 
                                handleQtyChange,
                                isEditable
                            )}
                            data={data.items || []}
                            keyField="requestItemId"
                            showPagination={false}
                            showSearch={false}
                        />
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <RequestTimeline
                        selectedRequest={data}
                    />

                    <RequestApprovalActions
                        user={user}
                        allProductsApproved={allProductsApproved}
                        remarks={remarks}
                        setRemarks={setRemarks}
                        handleApproveRequest={handleApproveRequest}
                        handleRejectRequest={handleRejectRequest}
                        selectedRequest={data}
                    />
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                config={config}
            />
        </div>
    );
}