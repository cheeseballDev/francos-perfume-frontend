import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDelivery } from "@/hooks/delivery_hooks/useDelivery";
import { postReceiveDelivery } from "@/services/DeliveryService";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const REASON_OPTIONS = [
    { label: "Select reason...", value: "" },
    { label: "Damaged", value: "DAMAGED" },
    { label: "Missing", value: "MISSING" },
    { label: "Incorrect Item", value: "INCORRECT" },
    { label: "Expired", value: "EXPIRED" },
];

const DeliveryConfirmationPage = () => {
    const { deliveryId } = useParams();
    const navigate = useNavigate();
    const { fetchDeliveryDetails } = useDelivery();

    const [delivery, setDelivery] = useState(null);
    const [config, setConfig] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [itemReceipts, setItemReceipts] = useState({});

    useEffect(() => {
        if (!deliveryId) return;
        let isMounted = true;
        
        fetchDeliveryDetails(deliveryId).then((response) => {
            if (!isMounted || !response) return;
            const data = response.data || response;
            setDelivery(data);
            
            const initial = {};
            (data.items || []).forEach((item) => {
                initial[item.productId] = {
                    isReceived: true,
                    receivedQty: item.quantity,
                    reason: "",
                };
            });
            setItemReceipts(initial);
        });

        return () => { isMounted = false; };
    }, [deliveryId, fetchDeliveryDetails]);

    const handleReceiveToggle = (productId, isReceived, maxQty) => {
        setItemReceipts(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                isReceived,
                receivedQty: isReceived ? maxQty : 0, 
                reason: isReceived ? "" : prev[productId]?.reason,
            }
        }));
    };

    const handleQtyChange = (productId, qty, maxQty) => {
        let numericQty = Number(qty);
        if (numericQty > maxQty) numericQty = maxQty;
        if (numericQty < 0) numericQty = 0;

        setItemReceipts(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                receivedQty: numericQty,
                isReceived: numericQty > 0, 
                reason: numericQty === maxQty ? "" : prev[productId]?.reason
            }
        }));
    };

    const handleReasonChange = (productId, reason) => {
        setItemReceipts(prev => ({
            ...prev,
            [productId]: { ...prev[productId], reason }
        }));
    };

    const handleConfirm = () => {
        const items = delivery?.items || [];
        
        const isComplete = items.every((item) => {
            const receipt = itemReceipts[item.productId];
            return receipt?.isReceived && Number(receipt?.receivedQty) === Number(item.quantity);
        });

        setConfig({
            title: isComplete
                ? "Mark this delivery as completed?"
                : "Mark this delivery as partially completed?",
            description: isComplete
                ? "All items have been received in full. This will finalize the delivery and update your inventory."
                : "Some items are missing or received in lower quantities.",
            confirmText: isComplete ? "Confirm Completion" : "Confirm Partial",
            confirmVariant: isComplete ? "default" : "destructive",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    const payload = {
                        expiryDate: new Date().toISOString(),
                        items: items.map(item => {
                            const receipt = itemReceipts[item.productId];
                            return {
                                requestItemId: item.productId,
                                receivedQty: Number(receipt.receivedQty),
                                remarks: receipt.reason || null
                            };
                        })
                    };
                    
                    await postReceiveDelivery(deliveryId, payload);
                    navigate("/home/deliveries");
                } catch (error) {
                    setConfig({
                        isAlert: true,
                        title: "Action Failed",
                        description: `Failed to confirm delivery.${error}`,
                        confirmVariant: "destructive",
                        confirmText: "Acknowledge",
                        onConfirm: () => setConfig(null) 
                    });
                } finally {
                    setIsSubmitting(false);
                }
                setConfig(null);
            },
            onCancel: () => setConfig(null),
        });
    };

    if (!delivery) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center h-full font-montserrat text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                Loading delivery details...
            </div>
        );
    }

    const isInbound = delivery.direction === "INBOUND";

    return (
        <div className="flex flex-col h-full font-montserrat animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                    {delivery.deliveryDisplayId}
                </h1>
                <Badge variant="outline" className={`font-semibold border-none ${isInbound ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>
                    {delivery.direction}
                </Badge>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Requested Products</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-muted-foreground">
                                <th className="pb-3 text-left font-medium">ID</th>
                                <th className="pb-3 text-left font-medium">Perfume Name</th>
                                <th className="pb-3 text-center font-medium">Requested Qty</th>
                                <th className="pb-3 text-center font-medium">Received?</th>
                                <th className="pb-3 text-center font-medium">Received Qty</th>
                                <th className="pb-3 text-left font-medium">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(delivery.items || []).map((item) => {
                                const receipt = itemReceipts[item.productId] || {};
                                
                                return (
                                    <tr key={item.productId} className="border-b border-border last:border-0">
                                        <td className="py-4 text-muted-foreground">{item.productDisplayId || item.productId}</td>
                                        <td className="py-4 font-medium text-foreground">{item.productName}</td>
                                        <td className="py-4 text-center font-bold text-foreground">{item.quantity}</td>
                                        <td className="py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={receipt.isReceived ?? true}
                                                onChange={e => handleReceiveToggle(item.productId, e.target.checked, item.quantity)}
                                                className="w-5 h-5 accent-emerald-600 cursor-pointer"
                                            />
                                        </td>
                                        <td className="py-4 text-center">
                                            <input
                                                type="number"
                                                value={receipt.receivedQty ?? item.quantity}
                                                onChange={e => handleQtyChange(item.productId, e.target.value, item.quantity)}
                                                disabled={!receipt.isReceived}
                                                className="w-20 text-center border border-input bg-transparent text-foreground rounded px-2 py-1 disabled:opacity-50 disabled:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                                                min={0}
                                                max={item.quantity}
                                            />
                                        </td>
                                        <td className="py-4">
                                            <select
                                                value={receipt.reason || ""}
                                                onChange={e => handleReasonChange(item.productId, e.target.value)}
                                                disabled={receipt.isReceived && receipt.receivedQty === item.quantity}
                                                className="border border-input bg-transparent text-foreground rounded px-2 py-1 text-sm disabled:opacity-50 disabled:bg-muted focus:outline-none focus:ring-2 focus:ring-ring w-full"
                                            >
                                                {REASON_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Additional Remarks</h2>
                <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Add your comments or message for this request...."
                    className="w-full border border-input bg-background text-foreground rounded-lg p-3 text-sm resize-none h-28 outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full font-bold py-6 text-base" onClick={() => navigate(-1)} disabled={isSubmitting}>
                    Save Draft
                </Button>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-base" onClick={handleConfirm} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <CheckCircle size={18} className="mr-2" />}
                    {isSubmitting ? "Processing..." : "Confirm Delivery"}
                </Button>
            </div>

            <ConfirmDialog 
                isOpen={!!config} 
                onClose={() => setConfig(null)} 
                config={config} 
                isLoading={isSubmitting}
            />
        </div>
    );
};

export default DeliveryConfirmationPage;