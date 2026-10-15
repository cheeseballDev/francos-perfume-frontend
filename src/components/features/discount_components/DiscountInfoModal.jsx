import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DetailItem from "@/components/shared/DetailItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
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
    const { toast } = useToast();
    
    const [config, setConfig] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !selectedDiscount) return null;
    const discountId = selectedDiscount.discountId;
    const isActive = selectedDiscount?.discountStatus === "ACTIVE";
    

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
                try {
                    setIsSubmitting(true);
                    await removeDiscount(discountId);
                    
                    toast({
                        title: "Success",
                        description: "Discount deleted successfully.",
                    });

                    onClose();

                } catch (error) {
                    toast({
                        title: "Deletion Failed",
                        description: `An error occurred while deleting the discount.\n${error}`,
                        variant: "destructive",
                    });
                } finally {
                    setIsSubmitting(false);
                    setConfig(null);
                    setSelectedDiscount(null);
                }
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
                try {
                    setIsSubmitting(true);
                    await toggleStatus(discountId);

                    toast({
                        title: "Success",
                        description: isActive
                            ? "Discount successfully deactivated."
                            : "Discount successfully reactivated.",
                    });

                    onClose();

                } catch (error) {
                    toast({
                        title: "Reset Password Failed",
                        description: isActive 
                        ? `An error occurred while deactivating the discount.\n${error}`
                        : `An error occurred while reactivating the discount.\n${error}`,
                        variant: "destructive",
                    });

                } finally {
                    setIsSubmitting(false);
                    setConfig(null);
                    setSelectedDiscount(null);
                }
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
                isLoading={isSubmitting}
            />
        </>
    );
};

export default DiscountInfoModal;