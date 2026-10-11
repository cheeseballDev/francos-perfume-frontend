import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isValid, validateForm } from "@/utils/validationUtils";
import { useEffect, useState } from 'react';

const getDiscountFormData = (discount) => {
  if (!discount) {
    return {
      discountPrefix: "",
      discountName: "",
      discountType: "",
      discountAmount: "",
      discountPercent: "",
    };
  }

  const percentVal = discount.discountPercent 
    ? (discount.discountPercent > 0 && discount.discountPercent <= 1 
        ? discount.discountPercent * 100 
        : discount.discountPercent)
    : "";

  return {
    discountPrefix: discount.discountPrefix || "",
    discountName: discount.discountName || "",
    discountType: discount.discountType || "",
    discountAmount: discount.discountAmount ?? "",
    discountPercent: percentVal ?? "",
  };
};

const EditDiscountModal = ({ isOpen, onClose, selectedDiscount, filterOptions = [], updateDiscount }) => {
  const [config, setConfig] = useState(null);
  const [data, setData] = useState(() => getDiscountFormData(selectedDiscount));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && selectedDiscount) {
      setData(getDiscountFormData(selectedDiscount));
      setErrors({});
    }
  }, [isOpen, selectedDiscount]);

  if (!isOpen) return null;

  const isPercent = data.discountType === 'PERCENTAGE';

  const discountTypeOptionData = filterOptions.find(option => option.key === "discountType")?.options || [];
  const discountTypeOptions = discountTypeOptionData.filter(
    (option) => option.value !== "" && option.value !== "__all__"
  );

  const discountValidationSchema = {
    discountPrefix: [isValid.required, isValid.prefix],
    discountName: [isValid.required],
    discountType: [isValid.required],
    ...(isPercent 
      ? { discountPercent: [isValid.required, isValid.decimalNumber] }
      : { discountAmount: [isValid.required, isValid.decimalNumber] }
    )
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
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
      discountPercent: isPercent ? (Number(data.discountPercent) || 0) : 0,
      discountAmount: !isPercent ? (Number(data.discountAmount) || 0) : 0,
    };

    setConfig({
      title: "Are you sure you want to save changes for this discount?",
      confirmText: "Save Changes",
      onConfirm: async () => {
        await updateDiscount(selectedDiscount.discountId, payload);
        onClose();
      } 
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-4 py-4'>
            <FormField 
              label="Discount Prefix"
              value={data.discountPrefix}
              onChange={e => handleChange('discountPrefix', e.target.value)}
              placeholder="Enter discount prefix here..."
              error={errors.discountPrefix}
            />

            <FormField 
              label="Discount Name"
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
              onChange={(value) => handleTypeChange(value)}
              options={discountTypeOptions}
              placeholder="Select discount..."
              error={errors.discountType}
            />

            <FormField 
              label={isPercent ? "Discount Percentage (%)" : "Discount Amount (₱)"}
              value={isPercent ? data.discountPercent : data.discountAmount}
              onChange={e => handleChange(
                isPercent ? 'discountPercent' : 'discountAmount',
                e.target.value
              )}
              placeholder={isPercent ? "Enter discount percentage here..." : "Enter discount amount here..."}
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

            <Button onClick={handleSave}>
              Save Changes
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

export default EditDiscountModal;