import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { isValid, validateForm } from "@/utils/validationUtils";
import { useState } from 'react';
import { discardChangesConfig, guardDismiss } from "@/utils/modalUtils";

const CreateDiscountModal = ({ isOpen, onClose, filterOptions = [], createDiscount }) => {
    const [config, setConfig] = useState(null);
    const [data, setData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const isDirty = Object.values(data || {}).some((value) => value !== "" && value !== null && value !== undefined);
    const discardAndClose = () => {
        setData({});
        setErrors({});
        onClose();
    };
    const dismissGuard = guardDismiss({
        isBusy: isSubmitting,
        isDirty,
        onDirty: () => setConfig(discardChangesConfig(discardAndClose)),
    });

    const isPercent = data.discountType === 'PERCENTAGE';

    const discountTypeOptionData = filterOptions.find(option => option.key === "discountType")?.options || [];

    const discountValidationSchema = {
        discountPrefix: [isValid.required, isValid.prefix],
        discountName: [isValid.required],
        discountPercent: [isValid.numbersOnly],
        discountAmount: [isValid.numbersOnly],
        discountType: [isValid.required],
        ...(isPercent 
            ? { discountPercent: [isValid.required, isValid.decimalNumber] }
            : { discountAmount: [isValid.required, isValid.decimalNumber] }
        )
    };

    const discountTypeOptions = discountTypeOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );

    const handleChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
    
        if (errors[field]) {
            setErrors((prev) => ({...prev, [field]: null }));
        }
    };

    const handleTypeChange = (selectedType) => {
        setData((prev) => ({
            ...prev,
            discountType: selectedType,
            discountPercent: '',
            discountAmount: ''
        }));

        setErrors((prev) => ({
            ...prev,
            discountType: null,
            discountPercent: null,
            discountAmount: null
        }));
    };

    const handleSave = () => {
        const validationErrors = validateForm(data, discountValidationSchema);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            ...data,
            discountPercent: Number(data.discountPercent) || 0,
            discountAmount: Number(data.discountAmount) || 0,
        };

        setConfig({
            title: "Create discount?",
            description: "This will immediately be available to use under the Point-Of-Sale system",
            confirmText: "Create Discount",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await createDiscount(payload);

                    toast({
                        title: "Success",
                        description: "Discount created successfully.",
                    });

                    onClose();
                } catch (error) {
                    toast({
                        title: "Creation Failed",
                        description: `An error occurred while creating the discount.\n${error.response?.data}`,
                        variant: "destructive",
                        duration: 5000
                    });
                } finally {
                    setIsSubmitting(false);
                    setConfig(null);
                    setData(null);
                }
            } 
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
            className="sm:max-w-3xl"
            onPointerDownOutside={dismissGuard}
            onEscapeKeyDown={dismissGuard}
        >
                    <DialogHeader>
                        <DialogTitle>Create Discount</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <FormField 
                            label="Discount Prefix"
                            maxLength={3}
                            onChange={e => handleChange('discountPrefix', e.target.value)}
                            placeholder="ABC... (MUST BE 3 LETTERS ONLY)"
                            error={errors.discountPrefix}
                        />

                        <FormField 
                            label="Discount Name"
                            maxLength={25}
                            onChange={e => handleChange('discountName', e.target.value)}
                            placeholder="Enter discount name here..."
                            error={errors.discountName}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <FormSelect
                            label="Discount Type"
                            value={data.discountType ?? ''}
                            onChange={(value) => handleTypeChange(value)}
                            options={discountTypeOptions}
                            placeholder="Select discount type..."
                            error={errors.discountType}
                        />

                        <FormField 
                            label={isPercent ? "Discount Percentage (%)" : "Discount Amount (₱)"}
                            type="number"
                            step={isPercent ? "1" : "0.01"}
                            value={isPercent ? (data.discountPercent || '') : (data.discountAmount || '')}
                            onChange={e => {
                                const val = e.target.value;
                                const field = isPercent ? 'discountPercent' : 'discountAmount';
                                const maxLimit = isPercent ? 100 : 9999;
                                if (val === "") {
                                    handleChange(field, "");
                                    return;
                                }

                                const clampedValue = Math.min(maxLimit, Math.max(0, Number(val)));
                                handleChange(field, clampedValue);
                            }}
                            placeholder={isPercent ? "e.g. 10 (for 10%)" : "e.g. 50.00"}
                            error={isPercent ? errors.discountPercent : errors.discountAmount}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <Button 
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button 
                            onClick={handleSave} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
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

export default CreateDiscountModal;