import { ImageUpload } from '@/components/shared';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { deleteImage } from '@/services/ImageService';
import { isValid, validateForm } from '@/utils/validationUtils';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const getProductFormData = (product) => ({
    productName: product?.productName || "",
    productType: product?.productType || "",
    productGender: product?.productGender || "",
    productPrice: product?.productPrice || "",
    productDescription: product?.productDescription || "",
    productImageUrl: product?.productImageUrl || "",
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
    const [originalImageUrl, setOriginalImageUrl] = useState(selectedProduct?.productImageUrl || null);
    const [isRemovingImage, setIsRemovingImage] = useState(false);


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

            if (isRemovingImage && originalImageUrl) {
                await deleteImage(originalImageUrl, "product-pictures");
            }

            await updateProduct(selectedProduct.productId, data);
            
            toast({
                title: "Success",
                description: "Product updated successfully.",
            });

            onClose();
        } catch (error) {
            toast({
                title: "Update Failed",
                description: `An error occurred while updating the product.\n${error.response?.data}`,
                variant: "destructive",
                duration: 5000
            });
        } finally {
            setIsSubmitting(false);
            setConfig(null);
        }
    }

    const handleImageChange = (url) => {
        if (!url && originalImageUrl) {
            setIsRemovingImage(true);
        } else if (url) {
            setIsRemovingImage(false);
        }
        handleChange('productImageUrl', url);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Product</DialogTitle>
                    </DialogHeader>

                     <div className="py-4 border-b border-border">
                        <ImageUpload
                            value={data.productImageUrl}
                            onChange={handleImageChange}
                            bucket="product-pictures"
                            isEditing={true}
                            imageText='Product Image'
                            aspect={1}
                            //className=""
                        />
                    </div>

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

                   <div className="mt-2 flex flex-col gap-1.5">
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
                   
                    <div className="grid grid-cols-2 gap-6 mt-4 mb-2">
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
                            <Check className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Saving..." : "Save Changes"}
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