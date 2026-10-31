import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDelivery } from "@/hooks/delivery_hooks/useDelivery";
import { postReceiveDelivery } from "@/services/DeliveryService";
import { getAPIError } from "@/utils/apiErrorUtils";
import { ArrowLeft, CheckCircle, Loader2, PackageX, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const REASON_OPTIONS = [
    { label: "Select reason...", value: "" },
    { label: "Damaged", value: "DAMAGED" },
    { label: "Missing", value: "MISSING" },
    { label: "Incorrect Item", value: "INCORRECT" },
    { label: "Expired", value: "EXPIRED" },
];

const rowKey = (item) => String(item.requestItemId ?? item.deliveryItemId ?? item.productId);

const todayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const toUtcNoonIso = (dateString) => new Date(`${dateString}T12:00:00Z`).toISOString();

const RECEIPT_STATUS = {
    COMPLETE: "COMPLETE",
    PARTIAL: "PARTIAL",
    NOT_RECEIVED: "NOT_RECEIVED",
};

const STATUS_COPY = {
    [RECEIPT_STATUS.COMPLETE]: {
        button: "Confirm Delivery",
        title: "Confirm this delivery as received?",
        description: "All items were received in full. This will complete the delivery and add the items to inventory.",
        confirmText: "Confirm Delivery",
        confirmVariant: "success",
    },
    [RECEIPT_STATUS.PARTIAL]: {
        button: "Confirm Partial Delivery",
        title: "Confirm this as a partial delivery?",
        description: "Some items are missing or were received in lower quantities. Only the received quantities will be added to inventory.",
        confirmText: "Confirm Partial Delivery",
        confirmVariant: "destructive",
    },
    [RECEIPT_STATUS.NOT_RECEIVED]: {
        button: "Confirm Not Received Delivery",
        title: "Confirm that this delivery was not received?",
        description: "None of the items were received. No items will be added to inventory",
        confirmText: "Confirm Not Received",
        confirmVariant: "destructive",
    },
};

const DeliveryConfirmationPage = () => {
    const { deliveryId } = useParams();
    const navigate = useNavigate();
    const { fetchDeliveryDetails } = useDelivery();

    const [delivery, setDelivery] = useState(null);
    const [config, setConfig] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

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
                initial[rowKey(item)] = {
                    isReceived: true,
                    receivedQty: String(item.quantity),
                    reason: "",
                };
            });
            setItemReceipts(initial);
        });

        return () => { isMounted = false; };
    }, [deliveryId, fetchDeliveryDetails]);

    const items = useMemo(() => delivery?.items || [], [delivery]);

    const receivedOf = (item) => {
        const receipt = itemReceipts[rowKey(item)];
        if (!receipt?.isReceived) return 0;
        const qty = Number(receipt.receivedQty);
        return Number.isFinite(qty) ? qty : 0;
    };

    const status = useMemo(() => {
        if (items.length === 0) return RECEIPT_STATUS.NOT_RECEIVED;
        const totalReceived = items.reduce((sum, item) => sum + receivedOf(item), 0);
        if (totalReceived === 0) return RECEIPT_STATUS.NOT_RECEIVED;
        const allFull = items.every((item) => receivedOf(item) === Number(item.quantity));
        return allFull ? RECEIPT_STATUS.COMPLETE : RECEIPT_STATUS.PARTIAL;
    }, [items, itemReceipts]);

    const validation = useMemo(() => {
        const rows = {};
        items.forEach((item) => {
            const receipt = itemReceipts[rowKey(item)];
            if (!receipt) return;
            if (receipt.isReceived && String(receipt.receivedQty).trim() === "") {
                rows[rowKey(item)] = "Enter the received quantity.";
            } else if (receivedOf(item) < Number(item.quantity) && !receipt.reason) {
                rows[rowKey(item)] = "Select a reason for the missing quantity.";
            }
        });
        const needsExpiry = status !== RECEIPT_STATUS.NOT_RECEIVED;
        const expiryError = needsExpiry && !expiryDate ? "Enter the expiry date of the received stock." : null;
        return { rows, expiryError, isValid: Object.keys(rows).length === 0 && !expiryError };
    }, [items, itemReceipts, expiryDate, status]);

    const updateReceipt = (key, changes) => {
        setItemReceipts((prev) => ({ ...prev, [key]: { ...prev[key], ...changes } }));
    };

    const handleReceiveToggle = (item, isReceived) => {
        updateReceipt(rowKey(item), {
            isReceived,
            receivedQty: isReceived ? String(item.quantity) : "0",
            reason: isReceived ? "" : itemReceipts[rowKey(item)]?.reason || "",
        });
    };

    const handleQtyChange = (item, value) => {
        const maxQty = Number(item.quantity);
        if (value === "") {
            updateReceipt(rowKey(item), { receivedQty: "" });
            return;
        }
        let qty = Math.floor(Number(value));
        if (!Number.isFinite(qty)) return;
        qty = Math.min(Math.max(qty, 0), maxQty);
        updateReceipt(rowKey(item), {
            receivedQty: String(qty),
            reason: qty === maxQty ? "" : itemReceipts[rowKey(item)]?.reason || "",
        });
    };

    const handleQtyBlur = (item) => {
        const receipt = itemReceipts[rowKey(item)];
        const qty = Number(receipt?.receivedQty);
        if (receipt?.receivedQty === "" || qty === 0) {
            updateReceipt(rowKey(item), { isReceived: false, receivedQty: "0" });
        }
    };

    const submit = async () => {
        if (items.some((item) => item.requestItemId === undefined || item.requestItemId === null)) {
            setConfig({
                isAlert: true,
                title: "Couldn't confirm the delivery",
                description: "This delivery is missing item details. Refresh the page and try again.",
                confirmVariant: "destructive",
                confirmText: "Okay",
                onConfirm: () => setConfig(null),
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                expiryDate: toUtcNoonIso(expiryDate || todayLocal()),
                items: items.map((item) => {
                    const receipt = itemReceipts[rowKey(item)] || {};
                    return {
                        requestItemId: Number(item.requestItemId),
                        receivedQty: receivedOf(item),
                        remarks: receipt.reason || null,
                    };
                }),
            };

            await postReceiveDelivery(deliveryId, payload);
            setConfig(null);
            navigate("/home/deliveries");
        } catch (error) {
            setConfig({
                isAlert: true,
                title: "Couldn't confirm the delivery",
                description: getAPIError(error, "Something went wrong while confirming the delivery. Please try again."),
                confirmVariant: "destructive",
                confirmText: "Okay",
                onConfirm: () => setConfig(null),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirm = () => {
        if (!validation.isValid) {
            setShowErrors(true);
            return;
        }
        const copy = STATUS_COPY[status];
        setConfig({
            title: copy.title,
            description: copy.description,
            confirmText: copy.confirmText,
            confirmVariant: copy.confirmVariant,
            onConfirm: submit,
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
    const buttonCopy = STATUS_COPY[status];
    const ButtonIcon = status === RECEIPT_STATUS.COMPLETE ? CheckCircle
        : status === RECEIPT_STATUS.PARTIAL ? TriangleAlert
        : PackageX;
    const buttonColour = status === RECEIPT_STATUS.COMPLETE
        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
        : "bg-destructive hover:bg-destructive/90 text-destructive-foreground";

    return (
        <div className="flex flex-col h-full font-montserrat animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">
                    {delivery.deliveryDisplayId}
                </h1>
                <Badge
                    variant="outline"
                    className={`font-semibold border-none ${isInbound
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"}`}
                >
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
                            {items.map((item) => {
                                const key = rowKey(item);
                                const receipt = itemReceipts[key] || {};
                                const isFull = receipt.isReceived && Number(receipt.receivedQty) === Number(item.quantity);
                                const rowError = showErrors ? validation.rows[key] : null;

                                return (
                                    <tr key={key} className="border-b border-border last:border-0 align-top">
                                        <td className="py-4 text-foreground">{item.productDisplayId || item.productId}</td>
                                        <td className="py-4 font-medium text-foreground">{item.productName}</td>
                                        <td className="py-4 text-center font-bold text-foreground">{item.quantity}</td>
                                        <td className="py-4 text-center">
                                            <input
                                                type="checkbox"
                                                aria-label={`Received ${item.productName}`}
                                                checked={receipt.isReceived ?? true}
                                                onChange={(e) => handleReceiveToggle(item, e.target.checked)}
                                                className="w-5 h-5 accent-emerald-600 cursor-pointer"
                                            />
                                        </td>
                                        <td className="py-4 text-center">
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                aria-label={`Received quantity for ${item.productName}`}
                                                value={receipt.receivedQty ?? ""}
                                                onChange={(e) => handleQtyChange(item, e.target.value)}
                                                onBlur={() => handleQtyBlur(item)}
                                                disabled={!receipt.isReceived}
                                                aria-invalid={!!rowError}
                                                className="w-20 text-center border border-input bg-transparent text-foreground rounded px-2 py-1 disabled:opacity-50 disabled:bg-muted focus:outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive"
                                                min={0}
                                                max={item.quantity}
                                                step={1}
                                            />
                                        </td>
                                        <td className="py-4">
                                            <select
                                                value={receipt.reason || ""}
                                                aria-label={`Reason for ${item.productName}`}
                                                onChange={(e) => updateReceipt(key, { reason: e.target.value })}
                                                disabled={isFull}
                                                aria-invalid={!!rowError}
                                                className="border border-input bg-transparent text-foreground rounded px-2 py-1 text-sm disabled:opacity-50 disabled:bg-muted focus:outline-none focus:ring-2 focus:ring-ring w-full aria-invalid:border-destructive"
                                            >
                                                {REASON_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
                                                ))}
                                            </select>
                                            {rowError && <p role="alert" className="text-xs text-destructive mt-1">{rowError}</p>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6 mb-6">
                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                    <label htmlFor="expiry-date" className="text-lg font-bold text-foreground mb-1 block">Expiry Date</label>
                    <p className="text-xs text-muted-foreground mb-3">Printed on the received stock.</p>
                    <input
                        id="expiry-date"
                        type="date"
                        value={expiryDate}
                        min={todayLocal()}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        disabled={status === RECEIPT_STATUS.NOT_RECEIVED}
                        aria-invalid={showErrors && !!validation.expiryError}
                        className="w-full border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 aria-invalid:border-destructive"
                    />
                    {showErrors && validation.expiryError && (
                        <p role="alert" className="text-xs text-destructive mt-1">{validation.expiryError}</p>
                    )}
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">Additional Remarks</h2>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add your comments or message for this delivery..."
                        className="w-full border border-input bg-background text-foreground rounded-lg p-3 text-sm resize-none h-28 outline-none focus:ring-2 focus:ring-ring transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full font-bold py-6 text-base" onClick={() => navigate(-1)} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button className={`w-full font-bold py-6 text-base ${buttonColour}`} onClick={handleConfirm} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <ButtonIcon size={18} className="mr-2" />}
                    {isSubmitting ? "Processing..." : buttonCopy.button}
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
