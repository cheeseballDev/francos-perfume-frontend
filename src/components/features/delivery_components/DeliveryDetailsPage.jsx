import { useAuth } from "@/auth/UseAuth";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { ReferenceLink } from "@/components/shared/ReferenceText";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDeliveryDetails } from "@/hooks/delivery_hooks/useDeliveryDetails";
import { postCancelDelivery, postDispatchDelivery, postReceiveDelivery } from "@/services/DeliveryService";
import { getAPIError } from "@/utils/apiErrorUtils";
import { normalizeStatus } from "@/utils/statusUtils";
import { ArrowLeft, CheckCircle, Loader2, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryInformation from "./DeliveryInformation";

export default function DeliveryDetailsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { deliveryId } = useParams();

    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [config, setConfig] = useState(null);


    const {
        selectedDelivery,
        error: loadError,
        reload: reloadDelivery,
    } = useDeliveryDetails(deliveryId);

    const showActionError = (title, error) => {
        toast({
            title,
            description: `An error occurred.\n${getAPIError(error)}`,
            variant: "destructive",
            duration: 5000,
        });
    };

    const showAlertDialog = (title, description) => {
        setConfig({
            isAlert: true,
            title,
            description,
            confirmVariant: "destructive",
            confirmText: "Acknowledge",
            onConfirm: () => setConfig(null),
        });
    };

    if (!selectedDelivery && loadError) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center min-h-screen p-6 font-montserrat text-center">
                <XCircle className="h-10 w-10 text-destructive" />
                <p className="font-semibold text-foreground">Couldn't load this delivery</p>
                <p className="text-sm text-muted-foreground max-w-md">
                    {getAPIError(loadError, "The delivery could not be loaded.")}
                </p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/home/deliveries")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Deliveries
                    </Button>
                    <Button onClick={() => reloadDelivery().catch(() => {})}>Try Again</Button>
                </div>
            </div>
        );
    }

    if (!selectedDelivery) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center min-h-screen p-6 font-montserrat text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                Loading delivery details...
            </div>
        );
    }

    const isInbound = selectedDelivery.direction === "INBOUND";
    const isOutbound = selectedDelivery.direction === "OUTBOUND";
    const deliveryStatus = normalizeStatus(selectedDelivery.deliveryStatus);
    const isSameDestination = user?.branchLocation === selectedDelivery.toBranchName;

    const totalProducts = selectedDelivery.items?.length || 0;
    const totalUnits = selectedDelivery.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const isReceived =
        deliveryStatus === "COMPLETED" ||
        deliveryStatus === "PARTIAL" ||
        deliveryStatus === "NOT RECEIVED" ||
        (selectedDelivery.items || []).some((item) => (item.status || "").toUpperCase() === "RECEIVED");
    const totalReceived = selectedDelivery.items?.reduce((sum, item) => sum + (item.receivedQty || 0), 0) || 0;

    const handleMarkInTransit = () => {
        setConfig({
            title: "Mark as In Transit?",
            description: "This will notify the receiving branch that the delivery is on its way.",
            confirmText: "Mark In Transit",
            loadingText: "Marking as In Transit...",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await postDispatchDelivery(deliveryId);
                    await reloadDelivery();
                    setConfig(null);
                    toast({
                        title: "Success",
                        description: "Delivery marked as in transit successfully.",
                        className: "bg-emerald-600 text-white border-emerald-700",
                    });
                } catch (error) {
                    setConfig(null);
                    showActionError("Mark as In Transit Failed", error);
                    await reloadDelivery().catch(() => {});
                } finally {
                    setIsSubmitting(false);
                }
            },
        });
    };

    const handleCancelDelivery = () => {
        setConfig({
            title: "Cancel this delivery?",
            description: "This cannot be undone. The delivery will be cancelled.",
            confirmText: "Cancel Delivery",
            loadingText: "Cancelling...",
            confirmVariant: "destructive",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await postCancelDelivery(deliveryId);
                    setConfig(null);
                    toast({
                        title: "Success",
                        description: "Delivery cancelled successfully.",
                    });
                    navigate("/home/deliveries");
                } catch (error) {
                    setConfig(null);
                    showAlertDialog("Action Failed", `Failed to cancel the delivery: ${getAPIError(error)}`);
                } finally {
                    setIsSubmitting(false);
                }
            },
        });
    };

    const handleAcceptDelivery = () => {
        setConfig({
            title: "Accept this delivery?",
            description: "You are confirming that you accept this inbound delivery.",
            confirmText: "Accept Delivery",
            loadingText: "Accepting...",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await postReceiveDelivery(deliveryId, { accepted: true });
                    await reloadDelivery();
                    setConfig(null);
                } catch (error) {
                    setConfig(null);
                    showActionError("Accept Delivery Failed", error);
                } finally {
                    setIsSubmitting(false);
                }
            },
        });
    };

    const handleRejectDelivery = () => {
        setConfig({
            title: "Reject this delivery request?",
            description: "This will notify the source branch that the delivery has been rejected.",
            confirmText: "Reject Request",
            loadingText: "Rejecting...",
            confirmVariant: "destructive",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await postReceiveDelivery(deliveryId, { accepted: false });
                    setConfig(null);
                    navigate("/home/deliveries");
                } catch (error) {
                    setConfig(null);
                    showActionError("Reject Delivery Failed", error);
                } finally {
                    setIsSubmitting(false);
                }
            },
        });
    };

    const renderActionPanel = () => {
        if (isOutbound) {
            const isPendingDispatch = deliveryStatus === "PENDING" || deliveryStatus === "PENDING DISPATCH";

            if (isPendingDispatch) {
                return (
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
                        <h2 className="text-base font-bold text-foreground">Required Action</h2>
                        <p className="text-xs text-muted-foreground">Mark as in transit to notify the receiving branch.</p>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isSubmitting}
                            onClick={handleMarkInTransit}
                        >
                            <Truck className="w-4 h-4 mr-2" /> Mark as In Transit
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={isSubmitting}
                            onClick={handleCancelDelivery}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Cancel Delivery
                        </Button>
                    </div>
                );
            }

            if (deliveryStatus === "IN TRANSIT") {
                return (
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-2 text-center">
                        <h2 className="text-base font-bold text-foreground">Waiting for the Receiving Branch</h2>
                        <p className="text-xs text-muted-foreground">
                            This delivery is on its way. <span className="font-bold text-foreground">{selectedDelivery.toBranchName}</span> will confirm it once the items arrive.
                        </p>
                    </div>
                );
            }
        }

        if (isInbound) {
            const needsAcceptance = deliveryStatus === "PENDING";
            const inTransit = deliveryStatus === "IN TRANSIT" || deliveryStatus === "ACCEPTED" || deliveryStatus === "DISPATCHED";

            if (needsAcceptance && !isSameDestination) {
                return (
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
                        <h2 className="text-base font-bold text-foreground">Required Action</h2>
                        <p className="text-xs text-muted-foreground">Accept or reject this inbound request.</p>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isSubmitting}
                            onClick={handleAcceptDelivery}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Accept Request
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={isSubmitting}
                            onClick={handleRejectDelivery}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject Request
                        </Button>
                    </div>
                );
            }

            if (inTransit && isSameDestination) {
                return (
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
                        <h2 className="text-base font-bold text-foreground">Required Action</h2>
                        <p className="text-xs text-muted-foreground">Review and confirm the items received.</p>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isSubmitting}
                            onClick={() => navigate(`/home/deliveries/${deliveryId}/confirm`)}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Confirm Delivery
                        </Button>
                    </div>
                );
            }
        }

        return (
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-2 text-center">
                <h2 className="text-base font-bold text-foreground">No Action Required</h2>
                <p className="text-xs text-muted-foreground">
                    This delivery is currently <span className="font-bold text-foreground">{deliveryStatus}</span>.
                </p>
            </div>
        );
    };

    return (
        <div className="p-6 min-h-screen font-montserrat bg-background text-foreground">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => navigate("/home/deliveries")} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                    {selectedDelivery.deliveryDisplayId}
                </h1>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                    isInbound ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                }`}>
                    {selectedDelivery.direction}
                </span>
                {selectedDelivery.requestDisplayId && (
                    <span className="text-sm text-muted-foreground">
                        Request: <ReferenceLink reference={selectedDelivery.requestDisplayId} />
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DeliveryInformation delivery={selectedDelivery} />

                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Products</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="pb-3 text-left font-medium">ID</th>
                                        <th className="pb-3 text-left font-medium">Perfume Name</th>
                                        <th className="pb-3 text-center font-medium">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedDelivery.items || []).map((item, index) => (
                                        <tr key={item.deliveryItemId || index} className="border-b border-border last:border-0">
                                            <td className="py-4 text-foreground">{item.productDisplayId}</td>
                                            <td className="py-4 font-medium text-foreground">{item.productName}</td>
                                            <td className="py-4 text-center font-bold text-foreground">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Summary</h2>
                        <div className="space-y-2 text-sm font-medium">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Products:</span>
                                <span className="font-bold text-foreground">{totalProducts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Units:</span>
                                <span className="font-bold text-foreground">{totalUnits}</span>
                            </div>
                            {isReceived && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Received Units:</span>
                                        <span className="font-bold text-foreground">{totalReceived}</span>
                                    </div>
                                    <div className="space-y-1 pl-3 border-l-2 border-border">
                                        {(selectedDelivery.items || []).map((item, index) => (
                                            <div key={item.deliveryItemId || index} className="flex justify-between gap-3 text-xs">
                                                <span className="text-muted-foreground truncate">{item.productName}</span>
                                                <span className="font-semibold text-foreground shrink-0">
                                                    {item.receivedQty || 0} / {item.quantity || 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {renderActionPanel()}
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