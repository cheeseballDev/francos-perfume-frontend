import { ImageUpload } from '@/components/shared';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { discardChangesConfig, guardDismiss } from '@/utils/modalUtils';
import { isValid, validateForm } from '@/utils/validationUtils';
import { Check } from 'lucide-react';
import { useState } from 'react';

const productValidationSchema = {
    productName: [isValid.required],
    productDescription: [isValid.required],
    productPrice: [isValid.required, isValid.decimalNumber],
    productType: [isValid.required],
    productGender: [isValid.required],
};

const CreateProductModal = ({ isOpen, onClose, filterOptions, createProduct }) => {
    const { toast } = useToast();

    const [config, setConfig] = useState(null);
    const [data, setData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);


    if (!isOpen) return null;

    const isDirty = Object.values(data).some((value) => value !== "" && value !== null && value !== undefined);
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

    const typeOptionData = filterOptions.find(option => option.key === "productType")?.options || [];
    const genderOptionData = filterOptions.find(option => option.key === "productGender")?.options || [];
    
    const typeOptions = typeOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );

    const genderOptions = genderOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );

    const handleNameChange = (field, value) => {
        const validPattern = /^[a-zA-ZñÑàáâãäåæçèéêëìíîïðòóôõöùúûüýÿ\s'-]*$/;

        if (value === '' || validPattern.test(value)) {
            handleChange(field, value);
        }
    };

    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({...prev, [field]: null }));
        }
    };
    
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        
        const validationErrors = validateForm(data, productValidationSchema);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        try {
            setIsSubmitting(true);
            await createProduct(data);

            toast({
                title: "Success",
                description: "Product created successfully.",
            });

            onClose();

        } catch (error) {
            toast({
                title: "Creation Failed",
                description: `An error occurred while creating the product.\n${error.response?.data}`,
                variant: "destructive",
                duration: 5000
            });

        } finally {
            setIsSubmitting(false);
        }
    }


    return (
    <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent 
                    className="sm:max-w-xl max-h-[90vh] p-0 flex flex-col overflow-hidden"
                    onPointerDownOutside={dismissGuard}
                    onEscapeKeyDown={dismissGuard}
                >
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <DialogTitle className="text-xl font-bold">Create New Perfume</DialogTitle>
                    </DialogHeader>

                    {/* Form wrapper ensures Enter key works */}
                    <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
                        
                        <div className="flex-1 overflow-y-auto px-6 pb-4">
                            <div className="py-4 border-b border-border">
                                <ImageUpload
                                    value={data.profileImageUrl}
                                    onChange={(url) => handleChange('profileImageUrl', url)}
                                    bucket="product-pictures"
                                    isEditing={true}
                                    imageText='Product Image'
                                    aspect={1}
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4 py-4'>
                                <FormField 
                                    label="Perfume Name:"
                                    value={data.productName || ''}
                                    onChange={e => handleChange('productName', e.target.value)}
                                    placeholder="Enter New Perfume Name"
                                    maxLength={25}
                                    error={errors.productName}
                                />

                                <FormSelect
                                    label="Perfume Type:"
                                    onChange={(value) => handleNameChange('productType', value)}
                                    options={typeOptions}
                                    placeholder="Select perfume type"
                                    error={errors.productType}
                                />

                                <FormSelect
                                    label="Gender:"
                                    onChange={(value) => handleChange('productGender', value)}
                                    options={genderOptions}
                                    placeholder="Select gender"
                                    error={errors.gender}
                                />

                                <FormField 
                                    label="Price (₱):"
                                    type="number"
                                    max={9999}
                                    value={data.productPrice || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            handleChange('productPrice', "");
                                            return;
                                        }
                                        const clampedValue = Math.min(9999, Math.max(0, Number(val)));
                                        handleChange('productPrice', clampedValue);
                                    }}
                                    placeholder="Enter Price"
                                    error={errors.productPrice}
                                />
                            </div>

                            <div className="mt-2 flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-foreground">Description:</label>
                                <Textarea
                                    placeholder="Enter description..."
                                    className="resize-none h-20 bg-background"
                                    onChange={(e) => handleChange('productDescription', e.target.value)}
                                    aria-invalid={!!errors.productDescription} 
                                />
                                {errors.productDescription && (
                                    <span className="text-xs text-destructive">{errors.productDescription}</span>
                                )}
                            </div>
                        </div>
                    
                        {/* FIXED: STICKY FOOTER */}
                        <div className="grid grid-cols-2 gap-6 p-6 border-t border-border bg-card shrink-0">
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {isSubmitting ? "Saving..." : "Save as New Perfume"}
                            </Button>
                        </div>
                    </form>
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

export default CreateProductModal;