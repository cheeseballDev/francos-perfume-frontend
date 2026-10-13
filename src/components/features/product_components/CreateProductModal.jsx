import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
    const [config, setConfig] = useState(null);

    const [data, setData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    };
    

    const handleSave = async () => {
        const validationErrors = validateForm(data, productValidationSchema);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        try {
            setIsSubmitting(true);
            await createProduct(data);
            onClose();
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    /*
    const handleImageChange = (event) => {

    }
    */

    return (
    <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent 
                    className="sm:max-w-xl"
                    onInteractOutside={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create New Perfume</DialogTitle>
                    </DialogHeader>

                    <div className='grid grid-cols-2 gap-4 py-4'>
                        <FormField 
                            label="Perfume Name:"
                            onChange={e => handleChange('productName', e.target.value)}
                            placeholder="Enter New Perfume Name"
                            maxLength={25}
                            error={errors.productName}
                        />

                        <FormSelect
                            label="Perfume Type:"
                            onChange={(value) => handleChange('productType', value)}
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


  export default CreateProductModal;