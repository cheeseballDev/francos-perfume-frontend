import DetailItem from '@/components/shared/DetailItem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateTimeForTable, formatPeso } from '@/utils/formattingUtils';

const REASON_LABELS = {
    "CHANGE OF MIND": "Change of mind",
    "HIDDEN DEFECT": "Hidden defect",
};

const RETURNED_ITEM_LABELS = {
    "RETURN TO STOCK": "returned to inventory",
    DISCARD: "discarded",
};

const TransactionDetailsModal = ({ isOpen, onClose, selectedTransaction }) => {
    if (!isOpen || !selectedTransaction) return null;
    console.log(selectedTransaction);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-6">

                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Sales Order ID" value={selectedTransaction.salesOrderDisplayId || "N/A"}/>
                        <DetailItem label="Amount" value={selectedTransaction.amount ? `₱${selectedTransaction.amount}` : "N/A"}/>
                        <DetailItem 
                            label="Date and Time" 
                            value={formatDateTimeForTable(selectedTransaction.transactionDate) || "N/A"}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Processed By" value={selectedTransaction.processedBy || "N/A"} />
                        <DetailItem label="Branch Location" value={selectedTransaction.branchLocation || "N/A"} />
                        <DetailItem label="Payment Method" value={selectedTransaction.paymentMethod || "N/A"}/>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Discount Applied" value={selectedTransaction.discountName || "N/A"}/>
                        {selectedTransaction.paymentMethod === "GCASH" && (
                            <DetailItem label="GCash Reference Number" value={selectedTransaction.referenceNumber || "N/A"}/>
                        )}
                        {selectedTransaction.replacesSalesOrderDisplayId && (
                            <DetailItem label="Upgrade Payment For" value={selectedTransaction.replacesSalesOrderDisplayId}/>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground">Purchased Items</h3>
                        <div className="border rounded-md divide-y divide-border bg-card overflow-hidden">
                            {selectedTransaction.productList && selectedTransaction.productList.length > 0 ? (
                                selectedTransaction.productList.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 text-sm">
                                        <span className="font-medium text-foreground">{item.productName}</span>
                                        <span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-md text-xs font-semibold">
                                            Qty: {item.qty}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-muted-foreground text-center">No products found for this transaction.</div>
                            )}
                        </div>
                    </div>

                    {Array.isArray(selectedTransaction.replacements) && selectedTransaction.replacements.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Replacements</h3>
                            <div className="border rounded-md divide-y divide-border bg-card overflow-hidden">
                                {selectedTransaction.replacements.map((item) => (
                                    <div key={item.replacementDisplayId} className="flex flex-col gap-1 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                                        <span className="text-foreground">
                                            <span className="font-medium">{item.originalProductName} ×{item.quantity}</span>
                                            {" → "}
                                            <span className="font-medium">{item.replacementProductName}</span>
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {item.replacementDisplayId} · {REASON_LABELS[item.reason] ?? item.reason} · {RETURNED_ITEM_LABELS[item.returnedItemAction] ?? item.returnedItemAction}
                                            {Number(item.priceDifference) > 0 && ` · paid ${formatPeso(item.priceDifference)} (${item.upgradeSalesOrderDisplayId})`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TransactionDetailsModal;