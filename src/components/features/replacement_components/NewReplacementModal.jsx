import ConfirmDialog from "@/components/shared/ConfirmDialog";
import FormSelect from "@/components/shared/FormSelect";
import SearchableProductSelect from "@/components/shared/SearchableProductSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getReplaceableSale, getReplacementProducts, postReplacement } from "@/services/ReplacementService";
import { getAPIError } from "@/utils/apiErrorUtils";
import { formatDateTimeForTable, formatLabel, formatPeso } from "@/utils/formattingUtils";
import { discardChangesConfig, guardDismiss } from "@/utils/modalUtils";
import { openReceiptTab } from "@/utils/receiptWindowUtil";
import { AlertTriangle, Check, Loader2, Search, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { REASON_OPTIONS, SHOP_POLICY, reasonLabel, returnedItemForReason, returnedItemLabel, tierRank } from "./replacementOptions";

const EMPTY_FORM = {
    salesOrderDetailId: null,
    quantity: 1,
    replacementProductId: null,
    reason: "",
    remarks: "",
};

const EMPTY_PAYMENT = {
    method: "",
    amountPaid: "",
    referenceNumber: "",
};

const roundPeso = (value) => Math.round((Number(value) || 0) * 100) / 100;

const TierBadge = ({ tier }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
        tierRank(tier) === 2
            ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
            : "bg-secondary text-secondary-foreground border-border"
    }`}>
        {tier}
    </span>
);

const NewReplacementModal = ({ isOpen, onClose, onSaved }) => {
    const { toast } = useToast();

    const [salesOrderInput, setSalesOrderInput] = useState("");
    const [sale, setSale] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLooking, setIsLooking] = useState(false);
    const [lookupError, setLookupError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [payment, setPayment] = useState(EMPTY_PAYMENT);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [config, setConfig] = useState(null);

    const selectedItem = sale?.items?.find((item) => item.salesOrderDetailId === form.salesOrderDetailId) ?? null;

    const eligibleProducts = useMemo(() => {
        if (!selectedItem) return [];
        return products.filter((product) => tierRank(product.tier) >= tierRank(selectedItem.tier));
    }, [products, selectedItem]);

    const productOptions = eligibleProducts.map((product) => ({
        value: product.productId,
        label: `${product.productName} · ${product.tier} · ${formatPeso(product.productPrice)}`,
        availableQty: product.availableQty,
    }));

    const selectedProduct = eligibleProducts.find((product) => product.productId === form.replacementProductId) ?? null;

    const maxQty = selectedItem
        ? Math.max(0, Math.min(selectedItem.replaceableQuantity, selectedProduct ? selectedProduct.availableQty : selectedItem.replaceableQuantity))
        : 0;

    const quantity = Number(form.quantity) || 0;
    const unitDifference = selectedItem && selectedProduct ? roundPeso(selectedProduct.productPrice - selectedItem.unitPrice) : 0;
    const amountDue = unitDifference > 0 ? roundPeso(unitDifference * quantity) : 0;
    const unrefunded = unitDifference < 0 ? roundPeso(-unitDifference * quantity) : 0;
    const needsPayment = amountDue > 0;

    const cashReceived = parseFloat(payment.amountPaid) || 0;
    const change = Math.max(0, roundPeso(cashReceived - amountDue));

    const isPaymentValid = !needsPayment
        || (payment.method === "CASH" && cashReceived >= amountDue)
        || (payment.method === "GCASH" && payment.referenceNumber.trim().length > 0);

    const canSubmit = Boolean(
        sale?.isEligible
        && selectedItem
        && selectedProduct
        && quantity >= 1
        && quantity <= maxQty
        && form.reason
        && isPaymentValid
        && !isSubmitting
    );

    const isDirty = salesOrderInput.trim() !== "" || sale !== null;
    const guardClose = guardDismiss({
        isBusy: isSubmitting || isLooking,
        isDirty,
        onDirty: () => setConfig(discardChangesConfig(onClose)),
    });

    const dismissGuard = (event) => {
        const target = event?.detail?.originalEvent?.target ?? event?.target;
        if (target instanceof Element && target.closest("[data-searchable-dropdown]")) {
            event.preventDefault();
            return;
        }
        guardClose(event);
    };

    const returnedItemAction = returnedItemForReason(form.reason);

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleLookup = async () => {
        const key = salesOrderInput.trim();
        if (!key) return;

        setIsLooking(true);
        setLookupError("");
        setSale(null);
        setProducts([]);
        setForm(EMPTY_FORM);
        setPayment(EMPTY_PAYMENT);

        try {
            const found = await getReplaceableSale(key);
            setSale(found);

            const firstItem = found?.items?.find((item) => item.replaceableQuantity > 0);
            if (firstItem && found.isEligible) {
                setForm({ ...EMPTY_FORM, salesOrderDetailId: firstItem.salesOrderDetailId });
            }

            if (found?.isEligible) {
                const stock = await getReplacementProducts(found.branchId);
                setProducts(Array.isArray(stock) ? stock : []);
            }
        } catch (error) {
            setLookupError(getAPIError(error, "The sale could not be loaded."));
        } finally {
            setIsLooking(false);
        }
    };

    const handleSelectItem = (item) => {
        if (item.replaceableQuantity <= 0 || !sale?.isEligible) return;
        setForm((prev) => {
            const keepProduct = products.find((product) => product.productId === prev.replacementProductId);
            const stillAllowed = keepProduct && tierRank(keepProduct.tier) >= tierRank(item.tier);
            return {
                ...prev,
                salesOrderDetailId: item.salesOrderDetailId,
                quantity: 1,
                replacementProductId: stillAllowed ? prev.replacementProductId : null,
            };
        });
        setPayment(EMPTY_PAYMENT);
    };

    const handleSelectProduct = (productId) => {
        const product = eligibleProducts.find((option) => option.productId === productId);
        const limit = Math.max(1, Math.min(selectedItem?.replaceableQuantity ?? 1, product?.availableQty ?? 1));
        setForm((prev) => ({
            ...prev,
            replacementProductId: productId,
            quantity: Math.min(Number(prev.quantity) || 1, limit),
        }));
        setPayment(EMPTY_PAYMENT);
    };

    const handleQuantityChange = (value) => {
        if (value === "") {
            handleFormChange("quantity", "");
            return;
        }
        const next = Math.floor(Number(value));
        if (Number.isNaN(next)) return;
        handleFormChange("quantity", Math.max(1, Math.min(maxQty || 1, next)));
    };

    const handleCashChange = (value) => {
        if (value === "") {
            setPayment((prev) => ({ ...prev, amountPaid: "" }));
            return;
        }
        if (Number(value) < 0 || Number(value) > 99999) return;
        if (value.split(".")[0].length > 5) return;
        setPayment((prev) => ({ ...prev, amountPaid: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await postReplacement({
                salesOrderDetailId: form.salesOrderDetailId,
                replacementProductId: form.replacementProductId,
                quantity,
                reason: form.reason,
                remarks: form.remarks.trim() || null,
                paymentMethod: needsPayment ? payment.method : null,
                amountPaid: needsPayment && payment.method === "CASH" ? cashReceived : 0,
                referenceNumber: needsPayment && payment.method === "GCASH" ? payment.referenceNumber.trim() : null,
            });

            toast({
                title: "Replacement saved",
                description: result?.upgradeSalesOrderDisplayId
                    ? `${result.replacementDisplayId} saved. Upgrade payment recorded as ${result.upgradeSalesOrderDisplayId}.`
                    : `${result?.replacementDisplayId ?? "The replacement"} saved.`,
            });

            if (result?.receipt) {
                openReceiptTab(result.receipt);
            }

            onSaved?.();
            onClose();
        } catch (error) {
            toast({
                title: "Replacement failed",
                description: getAPIError(error),
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const askToConfirm = () => {
        if (!canSubmit) return;

        const paymentText = needsPayment
            ? `The customer pays ${formatPeso(amountDue)} by ${payment.method === "GCASH" ? "GCash" : "cash"}, recorded as a new sale.`
            : "No payment is needed.";

        setConfig({
            title: "Process this replacement?",
            description: `${selectedItem.productName} ×${quantity} will be replaced with ${selectedProduct.productName}. ${reasonLabel(form.reason)}; the returned perfume: ${returnedItemLabel(returnedItemAction).toLowerCase()}. ${paymentText} This can't be undone.`,
            confirmText: "Process",
            cancelText: "Go back",
            confirmVariant: "success",
            onConfirm: handleSubmit,
        });
    };

    const isFormLocked = !sale?.isEligible || isSubmitting;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
                <DialogContent
                    className="sm:max-w-3xl max-h-[92vh] overflow-y-auto font-montserrat"
                    onPointerDownOutside={dismissGuard}
                    onEscapeKeyDown={dismissGuard}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground">New Replacement</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-2">
                        <div className="rounded-lg border border-border bg-muted/40 p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                                <ShieldCheck size={16} /> Shop policy
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                                {SHOP_POLICY.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Sales Order ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={salesOrderInput}
                                    onChange={(e) => setSalesOrderInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                                    placeholder="e.g. SO-000123"
                                    maxLength={20}
                                    autoFocus
                                />
                                <Button onClick={handleLookup} disabled={!salesOrderInput.trim() || isLooking}>
                                    {isLooking ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                    Find Sale
                                </Button>
                            </div>
                            {lookupError && <p className="text-xs font-medium text-destructive">{lookupError}</p>}
                        </div>

                        {sale && (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-lg border border-border p-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Sales Order</p>
                                        <p className="font-bold text-foreground">{sale.salesOrderDisplayId}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Date</p>
                                        <p className="font-bold text-foreground text-sm">{formatDateTimeForTable(sale.transactionDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Branch</p>
                                        <p className="font-bold text-foreground text-sm">{formatLabel(sale.branchLocation) || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="font-bold text-foreground">{formatPeso(sale.totalAmount)}</p>
                                    </div>
                                </div>

                                {!sale.isEligible && (
                                    <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                        <span>{sale.notEligibleReason}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Perfume being returned</Label>
                                    <div className="border rounded-md divide-y divide-border bg-card overflow-hidden">
                                        {sale.items.map((item) => {
                                            const isSelected = item.salesOrderDetailId === form.salesOrderDetailId;
                                            const isDisabled = item.replaceableQuantity <= 0 || !sale.isEligible;
                                            return (
                                                <button
                                                    key={item.salesOrderDetailId}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => handleSelectItem(item)}
                                                    className={`w-full flex items-center justify-between gap-3 p-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        isSelected ? "bg-primary/15" : "hover:bg-muted"
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-3 min-w-0">
                                                        <input
                                                            type="radio"
                                                            readOnly
                                                            checked={isSelected}
                                                            disabled={isDisabled}
                                                            tabIndex={-1}
                                                            className="w-4 h-4 accent-primary shrink-0"
                                                        />
                                                        <span className="font-medium text-foreground truncate">{item.productName}</span>
                                                        <TierBadge tier={item.tier} />
                                                    </span>
                                                    <span className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                                                        <span>{formatPeso(item.unitPrice)}</span>
                                                        <span className="bg-muted px-2.5 py-1 rounded-md font-semibold">
                                                            {item.replacedQuantity > 0
                                                                ? `${item.replaceableQuantity} of ${item.quantity} left`
                                                                : `Qty: ${item.quantity}`}
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedItem && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-2 flex flex-col gap-2">
                                            <Label>Replace with</Label>
                                            <SearchableProductSelect
                                                productOptions={productOptions}
                                                selectedProduct={form.replacementProductId}
                                                setSelectedProduct={handleSelectProduct}
                                                placeholder={tierRank(selectedItem.tier) === 2 ? "Search Premium perfumes..." : "Search Classic or Premium perfumes..."}
                                                showStock
                                                inline
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {tierRank(selectedItem.tier) === 2
                                                    ? "Premium can only be exchanged for another Premium."
                                                    : "Any Classic scent, or a Premium scent if the customer pays the difference."}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={maxQty || 1}
                                                value={form.quantity}
                                                disabled={isFormLocked || maxQty <= 1}
                                                onChange={(e) => handleQuantityChange(e.target.value)}
                                                onBlur={() => !form.quantity && handleFormChange("quantity", 1)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedItem && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <FormSelect
                                            label="Reason"
                                            value={form.reason}
                                            onChange={(value) => handleFormChange("reason", value)}
                                            options={REASON_OPTIONS}
                                            placeholder="Select reason"
                                            disabled={isFormLocked}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <Label>Returned perfume</Label>
                                            <p className={`text-sm font-medium rounded-md border px-3 py-2 ${
                                                returnedItemAction === "DISCARD"
                                                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                                                    : returnedItemAction
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                                        : "border-border text-muted-foreground"
                                            }`}>
                                                {returnedItemAction === "DISCARD"
                                                    ? "Discarded (hidden defect)"
                                                    : returnedItemAction
                                                        ? "Returned to inventory (change of mind)"
                                                        : "Set by the reason"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedItem && (
                                    <div className="flex flex-col gap-2">
                                        <Label>Remarks (optional)</Label>
                                        <Textarea
                                            value={form.remarks}
                                            maxLength={250}
                                            disabled={isFormLocked}
                                            placeholder="e.g. Cracked cap, about 5 ml used"
                                            onChange={(e) => handleFormChange("remarks", e.target.value)}
                                        />
                                    </div>
                                )}

                                {selectedItem && selectedProduct && (
                                    <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Returned: {selectedItem.productName}</span>
                                            <span className="tabular-nums">{formatPeso(selectedItem.unitPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">New: {selectedProduct.productName}</span>
                                            <span className="tabular-nums">{formatPeso(selectedProduct.productPrice)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-2 font-bold text-base">
                                            <span>Amount to pay{quantity > 1 ? ` (×${quantity})` : ""}</span>
                                            <span className="tabular-nums">{formatPeso(amountDue)}</span>
                                        </div>
                                        {unrefunded > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                The new perfume costs {formatPeso(unrefunded)} less. No refund is given for the difference.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {needsPayment && sale.isEligible && (
                                    <div className="space-y-4 rounded-lg border border-border p-4">
                                        <p className="text-sm font-semibold text-foreground">Upgrade payment</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant={payment.method === "GCASH" ? "default" : "outline"}
                                                onClick={() => setPayment({ ...EMPTY_PAYMENT, method: "GCASH" })}
                                            >
                                                GCash
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={payment.method === "CASH" ? "default" : "outline"}
                                                onClick={() => setPayment({ ...EMPTY_PAYMENT, method: "CASH" })}
                                            >
                                                Cash
                                            </Button>
                                        </div>

                                        {payment.method === "CASH" && (
                                            <div className="grid grid-cols-2 gap-4 items-end">
                                                <div className="flex flex-col gap-2">
                                                    <Label>Amount received</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter amount..."
                                                        value={payment.amountPaid}
                                                        onChange={(e) => handleCashChange(e.target.value)}
                                                        className="text-right font-bold"
                                                    />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">Change</p>
                                                    <p className={`text-2xl font-extrabold tabular-nums ${cashReceived > 0 && cashReceived < amountDue ? "text-destructive" : "text-foreground"}`}>
                                                        {formatPeso(change)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {payment.method === "GCASH" && (
                                            <div className="flex flex-col gap-2">
                                                <Label>GCash reference ID</Label>
                                                <Input
                                                    placeholder="Enter reference ID..."
                                                    value={payment.referenceNumber}
                                                    maxLength={13}
                                                    onChange={(e) => setPayment((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <DialogFooter className="flex w-full justify-between sm:justify-between pt-2">
                        <Button
                            variant="ghost"
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-muted/50"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            <X size={16} /> Cancel
                        </Button>
                        <Button onClick={askToConfirm} disabled={!canSubmit}>
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Process Replacement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                config={config}
                isLoading={isSubmitting}
            />
        </>
    );
};

export default NewReplacementModal;
