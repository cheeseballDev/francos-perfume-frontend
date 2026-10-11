import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useDelivery } from "@/hooks/delivery_hooks/useDelivery";
import { cancelDelivery, dispatchDelivery, receiveDelivery } from "@/services/DeliveryService";
import { ArrowLeft, CheckCircle, Loader2, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryInformation from "./delivery_detail_components/DeliveryInformation";

export default function DeliveryDetailsPage() {
    const { deliveryId } = useParams();
    const navigate = useNavigate();
    const { fetchDeliveryDetails } = useDelivery();

    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [config, setConfig] = useState(null);

    const loadDeliveryData = async () => {
        try {
            const response = await fetchDeliveryDetails(deliveryId);
            if (response) {
                setSelectedDelivery(response.data || response);
            }
        } catch (error) {
            console.error("Failed to fetch delivery details:", error);
        }
    };

    useEffect(() => {
        if (!deliveryId) return;
        loadDeliveryData();
    }, [deliveryId, fetchDeliveryDetails]);

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

    const totalProducts = selectedDelivery.items?.length || 0;
    const totalUnits = selectedDelivery.items?.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // --- Action Handlers with Confirmation Dialogs --- //

    const handleMarkInTransit = () => {
        setConfig({
            title: "Mark as In Transit?",
            description: "This will notify the receiving branch that the delivery is on its way.",
            confirmText: "Mark In Transit",
            onConfirm: async () => {
                try {
                    await dispatchDelivery(deliveryId);
                    await loadDeliveryData(); // Refresh UI
                } catch (err) {
                    console.error("Failed to mark as in transit:", err);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleCancelRequest = () => {
        setConfig({
            title: "Cancel this request?",
            description: "This cannot be undone. The request will be terminated.",
            confirmText: "Cancel Request",
            confirmVariant: "destructive",
            onConfirm: async () => {
                try {
                    await cancelDelivery(deliveryId);
                    navigate("/home/deliveries"); // Go back since it's cancelled
                } catch (err) {
                    console.error("Failed to cancel delivery:", err);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleAcceptRequest = () => {
        setConfig({
            title: "Accept this delivery request?",
            description: "You are confirming that you accept this inbound delivery.",
            confirmText: "Accept Request",
            onConfirm: async () => {
                try {
                    await receiveDelivery(deliveryId, { accepted: true });
                    await loadDeliveryData(); // Refresh UI
                } catch (err) {
                    console.error("Failed to accept delivery:", err);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleRejectRequest = () => {
        setConfig({
            title: "Reject this delivery request?",
            description: "This will notify the source branch that the request has been rejected.",
            confirmText: "Reject Request",
            confirmVariant: "destructive",
            onConfirm: async () => {
                try {
                    await receiveDelivery(deliveryId, { accepted: false });
                    navigate("/home/deliveries"); // Go back since it's rejected
                } catch (err) {
                    console.error("Failed to reject delivery:", err);
                } finally {
                    setConfig(null);
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    // --- Dynamic Action Panel Rendering --- //

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
                            <Button variant="destructive" className="w-full" onClick={handleCancelRequest}>
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

            if (needsAcceptance) {
                return (
                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
                        <h2 className="text-base font-bold text-foreground">Required Action</h2>
                        <p className="text-xs text-muted-foreground">Accept or reject this inbound request.</p>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAcceptRequest}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Accept Request
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={handleRejectRequest}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject Request
                        </Button>
                    </div>
                );
            }

            if (inTransit) {
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

        // Default state if no actions are required (Completed, Cancelled, etc.)
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
                                            <td className="py-4 text-muted-foreground">{item.productDisplayId}</td>
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