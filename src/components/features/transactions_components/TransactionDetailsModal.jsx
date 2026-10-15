import DetailItem from '@/components/shared/DetailItem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateTimeForTable } from '@/utils/formattingUtils';

const TransactionDetailsModal = ({ isOpen, onClose, selectedTransaction }) => {
    if (!isOpen || !selectedTransaction) return null;

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

                    <div className="grid grid-cols-1 gap-6">
                        <DetailItem label="Discount Applied" value={selectedTransaction.discountName || "N/A"}/>
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
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TransactionDetailsModal;