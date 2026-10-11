import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DetailItem from "@/components/shared/DetailItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, KeyRound, MinusSquareIcon, PlusSquareIcon } from "lucide-react";
import { useState } from "react";

const DiscountInfoModal = ({
    isOpen,
    onClose,
    selectedDiscount,
    setSelectedDiscount,
    removeDiscount,
    toggleStatus,
    setIsEditDiscountModalOpen,
}) => {
    const [config, setConfig] = useState(null);

    if (!isOpen || !selectedDiscount) return null;
    const discountId = selectedDiscount.discountId;
    const isActive = selectedDiscount?.discountStatus?.toUpperCase() === "ACTIVE";

    const handleEditDiscount = () => {
        setIsEditDiscountModalOpen(true);
        onClose();
    };

    const handleRemoveDiscount = () => {
        setConfig({
            title: "Are you sure you want to delete this discount?",
            description: "The discount will be deleted. This action is irreversible.",
            confirmText: "Delete Discount",
            onConfirm: async () => {
                await removeDiscount(discountId);
                setSelectedDiscount(null);
                onClose();
            },
        });
    };

    const handleToggleStatus = () => {
        const text = isActive ? "deactivate" : "activate";

        setConfig({
            title: `Are you sure you want to ${text} this discount?`,
            description: isActive
                ? "This discount will no longer be available in the Point-Of-Sale system."
                : "This discount will be available to use again in the Point-Of-Sale system.",
            confirmText: `${isActive ? "Deactivate" : "Activate"} Discount`,
            onConfirm: async () => {
                await toggleStatus(discountId);
                setSelectedDiscount(null);
                onClose();
            },
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Discount Details</DialogTitle>
                    </DialogHeader>

                    <div className="p-8">
                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <DetailItem label="Discount prefix" value={selectedDiscount.discountPrefix || "N/A"} />
                            <DetailItem label="Discount name" value={selectedDiscount.discountName || "N/A"} />
                            <DetailItem label="Discount type" value={selectedDiscount.discountType || "N/A"} />
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <DetailItem 
                                label="Discount value" 
                                value={(() => {
                                    if (!selectedDiscount) return "N/A";

                                    if (selectedDiscount.discountType?.toUpperCase() === 'PERCENTAGE') {
                                        const pct = selectedDiscount.discountPercent ?? 0;
                                        const formattedPct = pct < 1 ? pct * 100 : pct;
                                        return `${formattedPct}%`;
                                    }

                                    const amount = selectedDiscount.discountAmount ?? 0;
                                    return `₱${Number(amount || 0)}`;
                                })()}
                            />
                            <DetailItem label="Discount status" value={selectedDiscount.discountStatus || "N/A"}/>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <Button onClick={handleEditDiscount}>
                                <Edit className="mr-2" size={16} />
                                Edit Discount
                            </Button>

                            <Button variant="destructive" onClick={handleRemoveDiscount}>
                                <KeyRound className="mr-2" size={16} />
                                Delete Discount
                            </Button>

                            <Button
                                className="col-span-2"
                                variant={isActive ? "destructive" : "default"}
                                onClick={handleToggleStatus}
                            >
                                {isActive ? <MinusSquareIcon className="mr-2" size={16} /> : <PlusSquareIcon className="mr-2" size={16} />}
                                {isActive ? "Deactivate Discount" : "Reactivate Discount"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                config={config}
            />
        </>
    );
};

export default DiscountInfoModal;