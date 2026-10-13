import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Check, Minus, Plus, X } from "lucide-react";
import { useState } from "react";

const getBatchFormData = (batch) => ({
    batchDisplayId: batch?.batchDisplayId,
    productId: batch?.productId,
    branchName: batch?.branchName,
    productDisplayId: batch?.productDisplayId,
    productName: batch?.productName,
    dateReceived: batch?.dateReceived,
    expiryDate: batch?.expiryDate,
    quantity: batch?.quantity || 0,
    reason: batch?.reason,
});

const EditBatchModal = ({ isOpen, onClose, selectedBatch, handleSaveBatchWrapper }) => {
    const { toast } = useToast();
  
    const [data, setData] = useState(() => getBatchFormData(selectedBatch))
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const minDate = selectedBatch?.dateReceived ? selectedBatch.dateReceived.split('T')[0] : "";

    const handleChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSave = async () => {
        if (minDate && data.expiryDate < minDate) {
            const errorMsg = `Target date cannot be earlier than the date received (${minDate}).`;
            setErrors((prev) => ({ ...prev, expiryDate: errorMsg }));
            toast({
                title: "Invalid Target Date",
                description: errorMsg,
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            await handleSaveBatchWrapper(selectedBatch.batchId, data);

            toast({
                title: "Success",
                description: "Batch updated successfully.",
            });

        } catch (error) {
            toast({
                title: "Update Failed",
                description: error?.message || "An error occurred while updating the batch.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
            className="max-w-md font-montserrat p-8" 
            showCloseButton={true}
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
        >
            <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
                Edit Batch: {data.batchDisplayId}
            </DialogTitle>
            </DialogHeader>

            <div className="py-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
                <span className="w-1/3 text-sm text-muted-foreground font-medium">Selected Perfume:</span>
                <span className="w-2/3 font-bold text-foreground text-base">{data.productName}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
                <span className="w-1/3 text-sm text-muted-foreground font-medium">Date Received:</span>
                <span className="w-2/3 font-bold text-foreground text-base">{data.dateReceived}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
                <span className="w-1/3 text-sm text-muted-foreground font-medium">Target Date:</span>
                <div className="w-2/3">
                <Input
                    type="date"
                    value={data.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className="w-full text-foreground bg-transparent"
                />
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <span className="w-1/3 text-sm text-muted-foreground font-medium">Stock Adjustment:</span>
                <div className="w-2/3 flex items-center gap-2">
                <Button 
                    variant="secondary" 
                    size="icon-sm" 
                    onClick={() => handleChange('quantity', Math.min(99, data.quantity + 1))}
                >
                    <Plus size={16} />
                </Button>
                <Input
                    type="number"
                    value={data.quantity}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        handleChange('quantity', Math.min(99, Math.max(0, val)));
                    }}
                    min={0}
                    max={99}
                    className="w-24 text-center font-bold text-lg focus:ring-ring"
                />
                <Button 
                    variant="secondary" 
                    size="icon-sm" 
                    onClick={() => handleChange('quantity',Math.max(0, data.quantity - 1))}
                >
                    <Minus size={16} />
                </Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <span className="w-1/3 text-sm text-muted-foreground font-medium">Reason for edit:</span>
                <div className="w-2/3">
                <Select 
                    value={data.reason} 
                    onValueChange={(newReason) => handleChange('reason', newReason)}
                    >
                    <SelectTrigger className="w-full bg-transparent">
                    <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Restock">Restock</SelectItem>
                    <SelectItem value="Correction">Correction</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            </div>

            <DialogFooter className="flex w-full justify-between sm:justify-between pt-2">
            <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-muted/50" onClick={onClose}>
                <X size={16} /> Cancel
            </Button>
            <Button 
                onClick={handleSave}
                disabled={isSubmitting}
                >
                <Check size={16} /> Save
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
};

export default EditBatchModal;