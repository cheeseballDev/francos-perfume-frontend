import { useAuth } from "@/auth/UseAuth";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable from "@/components/shared/DataTable";
import { ReferenceLink } from "@/components/shared/ReferenceText";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRequestDetails } from "@/hooks/request_hooks/useRequestDetails";
import { patchApproveRequest, patchCancelRequest, patchRejectRequest } from "@/services/RequestService";
import { canUserApproveRequest } from "@/utils/requestAuthorizationUtils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RequestApprovalActions } from "./request_detail_components/RequestApprovalActions";
import RequestInformation from "./request_detail_components/RequestInformation";
import RequestTimeline from "./request_detail_components/RequestTimeline";
import { requestedProductsColumns } from "./request_detail_components/RequestedProductsColumns";

export default function RequestDetailsPage() {

    const { toast } = useToast();
    const { user } = useAuth();

    const { requestId } = useParams();
    const navigate = useNavigate();
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [config, setConfig] = useState(null);

    const { 
        selectedRequest, 
        itemApprovals, 
        setItemApprovals 
    } = useRequestDetails(requestId);

    const data = selectedRequest?.data || {};

    const getRequestedQty = (requestItemId) =>
        data.items?.find((item) => item.requestItemId === requestItemId)?.requestedQty || 0;

    const handleApproveToggle = (requestItemId, isApproved) => {
        const requestedQty = getRequestedQty(requestItemId);
        setItemApprovals((prev) => ({
            ...prev,
            [requestItemId]: { isApproved, approvedQty: isApproved ? requestedQty : 0 },
        }));
    };

    const handleQtyChange = (requestItemId, value) => {
        const requestedQty = getRequestedQty(requestItemId);
        const parsed = parseInt(value, 10);
        const approvedQty = Math.min(requestedQty, Math.max(1, Number.isNaN(parsed) ? 1 : parsed));
        setItemApprovals((prev) => {
            if (prev[requestItemId]?.isApproved === false) return prev;
            return { ...prev, [requestItemId]: { isApproved: true, approvedQty } };
        });
    };
    
    const allProductsApproved = Object.values(itemApprovals).length > 0 && 
    Object.values(itemApprovals).every((item) => item.isApproved);

    const isOwner = user.branchLocation === "WAREHOUSE";
    const isPending = data.requestStatus === "PENDING";

    const canCancel = isPending && (isOwner || data.requestorEmployeeId === user.employeeId);

    const handleRejectRequest = async () => {
        if (!remarks.trim()) return;
        try {
            setIsSubmitting(true);
            await patchRejectRequest(requestId, remarks);
            navigate(0);
        } catch (error) {
            setConfig({
                isAlert: true,
                title: "Action Failed",
                description: `Failed to reject the request: ${error.response.data.message}`,
                confirmVariant: "destructive",
                confirmText: "Acknowledge",
                onConfirm: () => setConfig(null) 
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleApproveRequest = async () => {
        try {
            setIsSubmitting(true);
            const payload = (data.items || []).map((item) => {
            const approvalState = itemApprovals[item.requestItemId];
            const isApproved = approvalState ? approvalState.isApproved === true : true;
                return {
                    remarks: remarks || "N/A",
                    productId: item.productId,
                    requestedItemId: item.requestItemId,
                    isApproved,
                    requestedItemQty: isApproved
                        ? Math.min(item.requestedQty, Math.max(1, approvalState?.approvedQty ?? item.requestedQty))
                        : 0,
                };
            });
            await patchApproveRequest(requestId, payload);
            navigate(0);
        } catch (error) {
            setConfig({
                isAlert: true,
                title: "Action Failed",
                description: `Failed to approve the request: ${error.response.data.message}`,
                confirmVariant: "destructive",
                confirmText: "Acknowledge",
                onConfirm: () => setConfig(null) 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelRequest = async () => {
        setConfig({
            title: "Are you sure you want to cancel this request?",
            description:
                "This will mark the request as cancelled and cannot be undone. Are you sure you want to proceed?",
            confirmVariant: "destructive",
            confirmText: "Yes, Cancel Request",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await patchCancelRequest(requestId);

                    toast({
                        title: "Success",
                        description: "Request cancelled successfully.",
                    });

                    navigate("/home/requests");

                    } catch (error) {
                        toast({
                            title: "Cancel Request Failed",
                            description: `An error occurred while canceling the request.\n${error.response?.data}`,
                            variant: "destructive",
                            duration: 5000
                        });   

                    } finally {
                        setIsSubmitting(false);
                        setConfig(null);
                }
            } 
        });
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
                    {data.deliveryDisplayId && data.deliveryDisplayId !== "N/A" && (
                        <span className="text-sm text-muted-foreground">
                            Delivery: <ReferenceLink reference={data.deliveryDisplayId} />
                        </span>
                    )}
                </div>

                {canCancel && (
                    <Button 
                        variant="destructive" 
                        onClick={handleCancelRequest}
                    >
                        Cancel Request
                    </Button>
                )}
            </div>

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
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                config={config}
                isLoading={isSubmitting}
            />
        </div>
    );
}