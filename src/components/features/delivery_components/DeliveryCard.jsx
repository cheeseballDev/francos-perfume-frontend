import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, ShoppingCart, Truck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeliveryCard = ({
    delivery,
    activeTab, // Kept for prop compatibility, but no longer restricts button visibility
    onMarkInTransit,
    onCancelRequest,
    onAcceptRequest,
    onRejectRequest,
    onConfirmDelivery,
}) => {
    const navigate = useNavigate();

    const isInbound = delivery.direction === "INBOUND";
    
    // Normalize status to uppercase for reliable matching
    const deliveryStatus = (delivery.deliveryStatus || "").toUpperCase();

    const deliveryId = delivery.deliveryDisplayId;
    const route = `From ${delivery.fromBranchName} To ${delivery.toBranchName}`;
    const productCount = delivery.itemCount || 0;
    const unitCount = delivery.totalUnits || 0;

    const handleViewDetails = () => {
        navigate(`/home/deliveries/${delivery.deliveryId}`);
    };

    const renderActions = () => {
        // --------------------------------------------------
        // OUTBOUND LOGIC (The current user's branch is sending the stock)
        // --------------------------------------------------
        if (!isInbound) {
            const isPendingDispatch = deliveryStatus === "PENDING" || deliveryStatus === "PENDING DISPATCH";
            const canCancel = deliveryStatus !== "IN TRANSIT" && deliveryStatus !== "COMPLETED" && deliveryStatus !== "CANCELLED";

            return (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    {isPendingDispatch && (
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onMarkInTransit(delivery.deliveryId)}>
                            <Truck size={15} className="mr-2" /> Mark as In Transit
                        </Button>
                    )}
                    {canCancel && (
                        <Button variant="destructive" className="flex-1" onClick={() => onCancelRequest(delivery.deliveryId)}>
                            <XCircle size={15} className="mr-2" /> Cancel Request
                        </Button>
                    )}
                    <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleViewDetails}>
                        <Eye size={15} className="mr-2" /> View Details
                    </Button>
                </div>
            );
        }

        // --------------------------------------------------
        // INBOUND LOGIC (The current user's branch is receiving the stock)
        // --------------------------------------------------
        if (isInbound) {
            const needsAcceptance = deliveryStatus === "PENDING";
            const inTransit = deliveryStatus === "IN TRANSIT" || deliveryStatus === "ACCEPTED" || deliveryStatus === "DISPATCHED";

            return (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    {needsAcceptance && (
                        <>
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onAcceptRequest(delivery.deliveryId)}>
                                <CheckCircle size={15} className="mr-2" /> Accept Request
                            </Button>
                            <Button variant="destructive" className="flex-1" onClick={() => onRejectRequest(delivery.deliveryId)}>
                                <XCircle size={15} className="mr-2" /> Reject Request
                            </Button>
                        </>
                    )}
                    {inTransit && (
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onConfirmDelivery(delivery.deliveryId)}>
                            <CheckCircle size={15} className="mr-2" /> Confirm Delivery
                        </Button>
                    )}
                    <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleViewDetails}>
                        <Eye size={15} className="mr-2" /> View Details
                    </Button>
                </div>
            );
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                        <ShoppingCart size={28} className="text-muted-foreground" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-foreground">{deliveryId}</h3>
                            <StatusBadge status={delivery.direction} />
                            <StatusBadge status={delivery.deliveryStatus} />
                        </div>
                        {delivery.requestDisplayId && (
                            <p className="text-xs italic text-muted-foreground mt-0.5">
                                {delivery.requestDisplayId}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground">{route}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-foreground">{productCount} products</p>
                    <p className="text-xs text-muted-foreground">{unitCount} units</p>
                </div>
            </div>
            <div className="px-4 pb-4">
                {renderActions()}
            </div>
        </div>
    );
};

export default DeliveryCard;