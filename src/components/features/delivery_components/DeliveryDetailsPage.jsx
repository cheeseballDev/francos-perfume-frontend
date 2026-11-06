import { useAuth } from "@/auth/UseAuth";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { ReferenceLink } from "@/components/shared/ReferenceText";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDelivery } from "@/hooks/delivery_hooks/useDelivery";
import { postCancelDelivery, postDispatchDelivery, postReceiveDelivery } from "@/services/DeliveryService";
import { getAPIError } from "@/utils/apiErrorUtils";
import { ArrowLeft, CheckCircle, Loader2, Truck, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryInformation from "./DeliveryInformation";

export default function DeliveryDetailsPage() {
    const { deliveryId } = useParams();
    const navigate = useNavigate();
    const { fetchDeliveryDetails } = useDelivery();

    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [config, setConfig] = useState(null);
    const { toast } = useToast();

    const showActionError = (title, error) => {
        toast({
            title,
            description: getAPIError(error),
            variant: "destructive",
            duration: 5000,
        });
    };

    const { user } = useAuth();

    const loadDeliveryData = useCallback(async () => {
        try {
            const response = await fetchDeliveryDetails(deliveryId);
            if (response) {
                setSelectedDelivery(response.data);
                setLoadError(null);
            }
        } catch (error) {
            setLoadError(getAPIError(error, "The delivery could not be loaded."));
        }
    }, [deliveryId, fetchDeliveryDetails]);

    useEffect(() => {
        if (!deliveryId) return;
        loadDeliveryData();
    }, [deliveryId, fetchDeliveryDetails, loadDeliveryData]);

    if (!selectedDelivery && loadError) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center min-h-screen p-6 font-montserrat text-center">
                <XCircle className="h-10 w-10 text-destructive" />
                <p className="font-semibold text-foreground">Couldn't load this delivery</p>
                <p className="text-sm text-muted-foreground max-w-md">{loadError}</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/home/deliveries")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Deliveries
                    </Button>
                    <Button onClick={loadDeliveryData}>Try Again</Button>
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
    const deliveryStatus = (selectedDelivery.deliveryStatus || "").toUpperCase();
    const isSameDestination = user?.branchLocation === selectedDelivery.toBranchName;

    const totalProducts = selectedDelivery.items?.length || 0;
    const totalUnits = selectedDelivery.items?.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const isReceived = deliveryStatus === "COMPLETED"
        || deliveryStatus === "PARTIAL"
        || (selectedDelivery.items || []).some((item) => (item.status || "").toUpperCase() === "RECEIVED");
    const totalReceived = selectedDelivery.items?.reduce((sum, item) => sum + (item.receivedQty || 0), 0);

    const handleMarkInTransit = () => {
        setConfig({
            title: "Mark as In Transit?",
            description: "This will notify the receiving branch that the delivery is on its way.",
            confirmText: "Mark In Transit",
            onConfirm: async () => {
                try {
                    await postDispatchDelivery(deliveryId);
                    await loadDeliveryData();
                } catch (error) {
                    showActionError("Mark as In Transit Failed", error);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleCancelDelivery = () => {
        setConfig({
            title: "Cancel this delivery?",
            description: "This cannot be undone. The delivery will be cancelled.",
            confirmText: "Cancel Delivery",
            confirmVariant: "destructive",
            onConfirm: async () => {
                try {
                    await postCancelDelivery(deliveryId);
                    navigate("/home/deliveries");
                } catch (error) {
                    showActionError("Cancel Delivery Failed", error);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleAcceptDelivery = () => {
        setConfig({
            title: "Accept this delivery delivery?",
            description: "You are confirming that you accept this inbound delivery.",
            confirmText: "Accept Delivery",
            onConfirm: async () => {
                try {
                    await postReceiveDelivery(deliveryId, { accepted: true });
                    await loadDeliveryData();
                } catch (error) {
                    showActionError("Accept Delivery Failed", error);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleRejectDelivery = () => {
        setConfig({
            title: "Reject this delivery request?",
            description: "This will notify the source branch that the delivery has been rejected.",
            confirmText: "Reject Request",
            confirmVariant: "destructive",
            onConfirm: async () => {
                try {
                    await postReceiveDelivery(deliveryId, { accepted: false });
                    navigate("/home/deliveries");
                } catch (error) {
                    showActionError("Reject Delivery Failed", error);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const renderActionPanel = () => {
        if (isOutbound) {
            const isPendingDispatch = deliveryStatus === "PENDING" || deliveryStatus === "PENDING DISPATCH";
            const canCancel = deliveryStatus !== "IN TRANSIT" && deliveryStatus !== "COMPLETED" && deliveryStatus !== "CANCELLED";

            if (isPendingDispatch || canCancel) {
                return (
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
                        <h2 className="text-base font-bold text-foreground">Required Action</h2>
                        <p className="text-xs text-muted-foreground">Mark as in transit to notify the receiving branch.</p>
                        
                        {isPendingDispatch && (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleMarkInTransit}>
                                <Truck className="w-4 h-4 mr-2" /> Mark as In Transit
                            </Button>
                        )}
                        {canCancel && (
                            <Button variant="destructive" className="w-full" onClick={handleCancelDelivery}>
                                <XCircle className="w-4 h-4 mr-2" /> Cancel Request
                            </Button>
                        )}
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
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAcceptDelivery}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Accept Request
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={handleRejectDelivery}>
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
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate(`/home/deliveries/${deliveryId}/confirm`)}>
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
            />
        </div>
    );
}