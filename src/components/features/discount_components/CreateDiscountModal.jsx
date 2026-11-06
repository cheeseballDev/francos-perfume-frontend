import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { getAPIError } from "@/utils/apiErrorUtils";
import { discardChangesConfig, guardDismiss } from "@/utils/modalUtils";
import { isValid, validateForm } from "@/utils/validationUtils";
import { useState } from 'react';

const DISCOUNT_TYPE_OPTIONS = [
    { label: "Fixed", value: "FIXED" },
    { label: "Percentage", value: "PERCENTAGE" },
];

const EMPTY_DISCOUNT = {
    discountPrefix: '',
    discountName: '',
    discountType: 'FIXED',
    discountPercent: '',
    discountAmount: '',
};

const CreateDiscountModal = ({ isOpen, onClose, createDiscount }) => {
    const [config, setConfig] = useState(null);
    const [data, setData] = useState(EMPTY_DISCOUNT);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const isPercent = data.discountType === 'PERCENTAGE';
    const valueField = isPercent ? 'discountPercent' : 'discountAmount';

    const isDirty = Boolean(data.discountPrefix || data.discountName || data.discountPercent || data.discountAmount);

    const resetAndClose = () => {
        setData(EMPTY_DISCOUNT);
        setErrors({});
        onClose();
    };

    const dismissGuard = guardDismiss({
        isBusy: isSubmitting,
        isDirty,
        onDirty: () => setConfig(discardChangesConfig(resetAndClose)),
    });

    const discountValidationSchema = {
        discountPrefix: [isValid.required, isValid.prefix],
        discountName: [isValid.required],
        discountType: [isValid.required],
        [valueField]: isPercent
            ? [isValid.required, isValid.decimalNumber]
            : [isValid.required, isValid.decimalNumber, isValid.fixedDiscountAmount],
    };

    const handleChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handlePrefixChange = (value) => {
        if (value === '' || /^[a-zA-Z]*$/.test(value)) {
            handleChange('discountPrefix', value.toUpperCase());
        }
    };

    const handleTypeChange = (selectedType) => {
        setData((prev) => ({ ...prev, discountType: selectedType, discountPercent: '', discountAmount: '' }));
        setErrors((prev) => ({ ...prev, discountType: null, discountPercent: null, discountAmount: null }));
    };

    const handleValueChange = (raw) => {
        if (raw === '') {
            handleChange(valueField, '');
            return;
        }
        const value = Number(raw);
        if (Number.isNaN(value)) return;
        const maxLimit = isPercent ? 100 : 9999;
        handleChange(valueField, Math.min(maxLimit, Math.max(0, value)));
    };

    const handleSave = () => {
        const validationErrors = validateForm(data, discountValidationSchema);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            discountPrefix: data.discountPrefix.trim(),
            discountName: data.discountName.trim(),
            discountType: data.discountType,
            discountPercent: isPercent ? Number(data.discountPercent) : 0,
            discountAmount: isPercent ? 0 : Number(data.discountAmount),
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
                    setConfig(null);
                    resetAndClose();
                } catch (error) {
                    const message = getAPIError(error);
                    toast({
                        title: "Creation Failed",
                        description: `An error occurred while creating the discount.\n${message}`,
                        variant: "destructive",
                        duration: 5000
                    });
                    setConfig(null);
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (open || isSubmitting) return;
                    if (isDirty) {
                        setConfig(discardChangesConfig(resetAndClose));
                        return;
                    }
                    resetAndClose();
                }}>
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
                            value={data.discountPrefix}
                            onChange={e => handlePrefixChange(e.target.value)}
                            placeholder="ABC... (MUST BE 3 LETTERS ONLY)"
                            error={errors.discountPrefix}
                        />

                        <FormField
                            label="Discount Name"
                            maxLength={25}
                            value={data.discountName}
                            onChange={e => handleChange('discountName', e.target.value)}
                            placeholder="Enter discount name here..."
                            error={errors.discountName}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <FormSelect
                            label="Discount Type"
                            value={data.discountType}
                            onChange={handleTypeChange}
                            options={DISCOUNT_TYPE_OPTIONS}
                            placeholder="Select discount type..."
                            error={errors.discountType}
                        />

                        <FormField
                            label={isPercent ? "Discount Percentage (%)" : "Discount Amount (₱)"}
                            type="number"
                            step={isPercent ? "1" : "0.01"}
                            value={data[valueField]}
                            onChange={e => handleValueChange(e.target.value)}
                            placeholder={isPercent ? "e.g. 10 (for 10%)" : "e.g. 50.00"}
                            error={errors[valueField]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <Button variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
                            Cancel
                        </Button>

                        <Button onClick={handleSave} disabled={isSubmitting}>
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