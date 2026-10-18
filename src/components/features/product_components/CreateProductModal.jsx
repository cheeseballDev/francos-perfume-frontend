import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { isValid, validateForm } from '@/utils/validationUtils';
import { Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const productValidationSchema = {
    productName: [isValid.required],
    productDescription: [isValid.required],
    productPrice: [isValid.required, isValid.decimalNumber],
    productType: [isValid.required],
    productGender: [isValid.required],
};

const CreateProductModal = ({ isOpen, onClose, filterOptions, createProduct }) => {
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const [config, setConfig] = useState(null);
    const [data, setData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [imagePreview, setImagePreview] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setData({});
            setErrors({});
            setImagePreview(null);
            setIsUploadingImage(false);
        }
    }, [isOpen]);

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
    
    // Changed to standard form submission
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

    const handleTriggerImageUpload = () => fileInputRef.current?.click();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast({ title: "Invalid file type", description: "Please upload a PNG or JPEG image.", variant: "destructive" });
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            toast({ title: "File too large", description: "Please upload an image smaller than 15 MB.", variant: "destructive" });
            return;
        }

        setIsUploadingImage(true);
        setTimeout(() => {
            setImagePreview(URL.createObjectURL(file));
            setIsUploadingImage(false);
            toast({ title: "Upload Successful", description: "Product image attached (Simulated).", className: "bg-emerald-600 text-white border-emerald-700" });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }, 1000);
    };

    const handleRemoveImage = () => {
        setIsUploadingImage(true);
        setTimeout(() => {
            setImagePreview(null);
            setIsUploadingImage(false);
            toast({ title: "Picture Removed", description: "Product image removed (Simulated)." });
        }, 800);
    };

    return (
    <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent 
                    className="sm:max-w-xl max-h-[90vh] p-0 flex flex-col overflow-hidden"
                    onInteractOutside={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <DialogTitle className="text-xl font-bold">Create New Perfume</DialogTitle>
                    </DialogHeader>

                    {/* Form wrapper ensures Enter key works */}
                    <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
                        
                        <div className="flex-1 overflow-y-auto px-6 pb-4">
                            <div className="flex items-center gap-6 py-4 border-b border-border">
                                <div className="h-24 w-24 rounded-xl border-2 border-border flex items-center justify-center overflow-hidden bg-muted shrink-0 relative">
                                    {isUploadingImage ? (
                                        <Loader2 className="animate-spin text-muted-foreground" size={32} />
                                    ) : imagePreview ? (
                                        <img src={imagePreview} alt="Product Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon size={40} className="text-muted-foreground stroke-[1.5]" />
                                    )}
                                </div>
                                
                                <div className="flex-grow">
                                    <h3 className="text-[16px] font-bold text-foreground">Product Image</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">PNG, JPEG under 15 MB</p>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg" className="hidden" />
                                    
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleTriggerImageUpload} variant="outline" disabled={isUploadingImage}>
                                            {isUploadingImage ? "Uploading..." : "Upload Image"}
                                        </Button>
                                        <Button type="button" size="sm" variant="destructive" onClick={handleRemoveImage} disabled={isUploadingImage || !imagePreview}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>

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
            />
        </>
    );
};

export default CreateProductModal;