import DetailItem from "@/components/shared/DetailItem";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTimeForTable, formatLabel, formatPeso } from "@/utils/formattingUtils";
import { reasonLabel, returnedItemLabel } from "./replacementOptions";

const ReplacementDetailsModal = ({ isOpen, onClose, replacement }) => {
    if (!isOpen || !replacement) return null;

    const paid = Number(replacement.priceDifference) > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl font-montserrat">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Replacement {replacement.replacementDisplayId}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Sales Order ID" value={replacement.salesOrderDisplayId || "N/A"} />
                        <DetailItem label="Date and Time" value={formatDateTimeForTable(replacement.replacedAt)} />
                        <DetailItem label="Branch Location" value={formatLabel(replacement.branchLocation) || "N/A"} />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Returned Perfume" value={`${replacement.originalProductName} ×${replacement.quantity}`} />
                        <DetailItem label="Original Price" value={formatPeso(replacement.originalUnitPrice)} />
                        <DetailItem label="Reason" value={reasonLabel(replacement.reason)} />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Replaced With" value={replacement.replacementProductName} />
                        <DetailItem label="New Perfume Price" value={formatPeso(replacement.replacementUnitPrice)} />
                        <DetailItem label="Returned Item" value={returnedItemLabel(replacement.returnedItemAction)} />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Amount Paid for Upgrade" value={paid ? formatPeso(replacement.priceDifference) : "None"} />
                        <DetailItem label="Upgrade Sales Order" value={replacement.upgradeSalesOrderDisplayId || "N/A"} />
                        <DetailItem label="Processed By" value={replacement.processedBy || "N/A"} />
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{replacement.remarks || "None"}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReplacementDetailsModal;
