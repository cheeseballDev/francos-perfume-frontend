import ConfirmDialog from '@/components/shared/ConfirmDialog';
import DetailItem from '@/components/shared/DetailItem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTimeForTable } from '@/utils/formattingUtils';
import { useState } from 'react';

const ArchivedProductDetailsModal = ({ isOpen, onClose, selectedArchivedProduct, restoreArchivedProduct, setSelectedArchivedProduct}) => {
    const { toast } = useToast();

    const [config, setConfig] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !selectedArchivedProduct) return null;

    const handleRestoreArchive = () => {
        setConfig({
        title: "Are you sure you want to restore this product?",
        description:
            "The product will be available to request from all branches again.",
        confirmText: "Restore Product",
        onConfirm: async () => {
            try {
                setIsSubmitting(true);
                await restoreArchivedProduct(selectedArchivedProduct.productArchiveId);

                toast({
                    title: "Success",
                    description: "Product restored successfully.",
                })

            } catch (error) {
                toast({
                    title: "Update Failed",
                    description: `An error occurred while restoring the product.\n${error.response?.data}`,
                    variant: "destructive",
                    duration: 5000
                });
            } finally {
                setIsSubmitting(false);
                setConfig(null);
                setSelectedArchivedProduct(null);
            }
        },
        });
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
                    </DialogHeader>

                    <div className="p-4 space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                            <DetailItem label="Product ID" value={selectedArchivedProduct.productDisplayId || "N/A"}/>
                            <DetailItem label="Archived By" value={selectedArchivedProduct.archivedBy || "N/A"}/>
                            <DetailItem 
                                label="Date and Time Archived" 
                                value={formatDateTimeForTable(selectedArchivedProduct.dateArchived) || "N/A"}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <DetailItem label="Product Name" value={selectedArchivedProduct.productName || "N/A"} />
                            <DetailItem label="Product Type" value={selectedArchivedProduct.productType || "N/A"}/>
                            <DetailItem label="Product Gender" value={selectedArchivedProduct.productGender || "N/A"} />
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleRestoreArchive}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Restoring..." : "Restore Product"}
                    </Button>

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

export default ArchivedProductDetailsModal;