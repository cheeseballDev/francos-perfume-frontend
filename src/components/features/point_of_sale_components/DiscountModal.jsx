import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDiscounts } from '@/hooks/discount_hooks/useDiscount';
import { X } from 'lucide-react';
import { useState } from 'react';
import ModalOverlay from "@/components/shared/ModalOverlay";

const DiscountModal = ({ isOpen, onClose, onApply }) => {
    const {
        discounts
    } = useDiscounts();

    const [selectedDiscountId, setSelectedDiscountId] = useState('');

    if (!isOpen) return null;

    const activeDiscounts = (discounts || []).filter(d => d.discountStatus === 'ACTIVE');

    const selectedDiscount = activeDiscounts.find(
        (d) => String(d.discountId) === String(selectedDiscountId)
    );

    const handleApplyClick = () => {
        if (!selectedDiscount) return;

        const discountValue = 
        selectedDiscount.discountType === 'PERCENTAGE'
            ? (selectedDiscount.discountPercent > 1 ? selectedDiscount.discountPercent / 100 : selectedDiscount.discountPercent)
            : selectedDiscount.discountAmount;

        onApply(discountValue, selectedDiscount.discountId, selectedDiscount.discountType);
        onClose();
    };

    return (
        <ModalOverlay onClose={onClose} className="p-6 z-[100] bg-black/70 backdrop-blur-sm transition-all">
        <div role="dialog" aria-modal="true" className="bg-card text-card-foreground rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-border">
            <div className="m-6">
                <div className="flex justify-between items-center ">
                <h3 className="text-2xl font-bold text-foreground">Add Discount</h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={28} />
                </button>
            </div>
            
            <div className="mt-4 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Select Discount Option:</label>
                    <Select
                        value={selectedDiscountId} 
                        onValueChange={setSelectedDiscountId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a discount..." />
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                            {activeDiscounts.map((discount) => (
                                <SelectItem key={discount.discountId} value={String(discount.discountId)}>
                                    {discount.discountPrefix}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {selectedDiscount && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2 transition-all">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount Details</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-foreground">Discount Name:</span>
                            <span className="text-sm font-bold px-2 py-0.5">
                                {selectedDiscount.discountName}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-foreground">Type:</span>
                            <span className="text-sm font-bold px-2 py-0.5">
                                {selectedDiscount.discountType}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-foreground">Value:</span>
                            <span className="text-sm font-bold text-emerald-500 flex items-center">
                                {selectedDiscount.discountType === 'PERCENTAGE' ? (
                                    <>

                                        {selectedDiscount.discountPercent > 1 
                                            ? selectedDiscount.discountPercent 
                                            : selectedDiscount.discountPercent * 100} %
                                    </>
                                ) : (
                                    <>
                                        ₱ {selectedDiscount.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                )}

            <Button
                disabled={!selectedDiscountId}
                onClick={handleApplyClick}
                className="w-full font-bold py-3.5 rounded mt-4 hover:bg-primary/90 transition-colors"
            >
                APPLY DISCOUNT
            </Button>

            </div>
            </div>
        </div>
    </ModalOverlay>
  );
};

export default DiscountModal;