import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { isValid, validateForm } from '@/utils/validationUtils';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const getProductFormData = (product) => ({
    productName: product?.productName || "",
    productType: product?.productType || "",
    productGender: product?.productGender || "",
    productPrice: product?.productPrice || "",
    productDescription: product?.productDescription || "",
});

const productValidationSchema = {
    productName: [isValid.required],
    productType: [isValid.required],
    productGender: [isValid.required],
    productPrice: [isValid.required, isValid.decimalNumber],
    productDescription: [isValid.required],
};

const EditProductModal = ({ isOpen, onClose, selectedProduct, filterOptions = [], updateProduct }) => {
    const { toast } = useToast();

    const [config, setConfig] = useState(null);
    const [data, setData] = useState(() => getProductFormData(selectedProduct));
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && selectedProduct) {
            setData(getProductFormData(selectedProduct));
            setErrors({});
        }
    }, [isOpen, selectedProduct]);

    if (!isOpen) return null;

    const typeOptionData = filterOptions.find(option => option.key === "productType")?.options || [];
    const genderOptionData = filterOptions.find(option => option.key === "productGender")?.options || [];
    
    const typeOptions = typeOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );

    const genderOptions = genderOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );

    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
            setErrors((prev) => ({...prev, [field]: null }));
        }
    }

    const handleSave = async () => {
        const validationErrors = validateForm(data, productValidationSchema);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            await updateProduct(selectedProduct.productId, data);
            
            toast({
                title: "Success",
                description: "Product updated successfully.",
            });

            onClose();
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error?.message || "An error occurred while updating the product.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
            setConfig(null);
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create New Perfume</DialogTitle>
                    </DialogHeader>

                    <div className='grid grid-cols-2 gap-4 py-4'>
                        <FormField 
                            label="Perfume Name:"
                            value={data.productName}
                            maxLength={25}
                            onChange={e => handleChange('productName', e.target.value)}
                            placeholder="Enter New Perfume Name"
                            error={errors.productName}
                        />

                        <FormSelect
                            label="Perfume Type:"
                            value={data.productType}
                            onChange={(value) => handleChange('productType', value)}
                            options={typeOptions}
                            placeholder="Select perfume type"
                            error={errors.productType}
                        />

                        <FormSelect
                            label="Gender:"
                            value={data.productGender}
                            onChange={(value) => handleChange('productGender', value)}
                            options={genderOptions}
                            placeholder="Select gender"
                            error={errors.gender}
                        />

                        <FormField 
                            label="Price (₱):"
                            type="number"
                            max={9999}
                            value={data.productPrice}
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

                   <div className="mt-4 flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Description:</label>
                            <Textarea
                                placeholder="Enter description..."
                                className="resize-none h-20"
                                value={data.productDescription || ""}
                                onChange={(e) => handleChange('productDescription', e.target.value)}
                                aria-invalid={!!errors.productDescription} 
                            />

                            {errors.productDescription && (
                                <span className="text-xs text-destructive">{errors.productDescription}</span>
                            )}
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
                            <Check className="w-4 h-4" />
                            {isSubmitting ? "Saving..." : "Save as New Perfume"}
                        </Button>
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

export default EditProductModal;