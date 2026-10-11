import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isValid, validateForm } from "@/utils/validationUtils";
import { useState } from 'react';

const accountValidationSchema = {
    firstName: [isValid.required],
    lastName: [isValid.required],
    email: [isValid.required, isValid.email],
    contactNumber: [isValid.required, isValid.phone],
    branchLocation: [isValid.required],
    employeeRole: [isValid.required],
    employeeShift: [isValid.required],
};

const ROLE_RANKS = {
    STAFF: 1,
    MANAGER: 2,
    ADMIN: 3,
    OWNER: 4,
};

const CreateAccountModal = ({ isOpen, onClose, filterOptions = [], createAccount }) => {
    const [config, setConfig] = useState(null);

    const [data, setData] = useState({});
    
    const [errors,setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const branchOptionData = filterOptions.find(option => option.key === "branchLocation")?.options || [];
    const roleOptionData = filterOptions.find(option => option.key === "employeeRole")?.options || [];
    const employeeShiftOptionData = filterOptions.find(option => option.key === "employeeShift")?.options || [];

    const branchOptions = branchOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );

    const roleOptions = roleOptionData.filter(
        (option) => {
        if (!option.value || option.value === "__all__") {
            return false;
        }

        const targetRoleRank = ROLE_RANKS[option.value.toUpperCase()] || 0;
        const currentUserRank = ROLE_RANKS[sessionStorage.getItem("trueRole")] || 0;

        return targetRoleRank < currentUserRank;
    });

    const employeeShiftOptions = employeeShiftOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );


    const handleChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSave = () => {
        const validationErrors = validateForm(data, accountValidationSchema);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setConfig({
        title: "Are you sure you want to create this account?",
        description: "This will make a new account for the employee.",
        confirmText: "Create Account",
        onConfirm: async () => {
            setIsSubmitting(true);
            await createAccount(data);
            setIsSubmitting(false);
            setData({});
            onClose();
        } 
        })
    }
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-3 gap-4 py-4'>
            <FormField 
              label="First Name"
              onChange={e => handleChange('firstName', e.target.value)}
              placeholder="Enter first name here..."
              error={errors.firstName}
            />

            <FormField 
              label="Middle Name"
              onChange={e => handleChange('middleName', e.target.value)}
              placeholder="Enter middle name here..."
              error={errors.middleName}
            />

            <FormField 
              label="Last Name"
              onChange={e => handleChange('lastName', e.target.value)}
              placeholder="Enter last name here..."
              error={errors.lastName}
            />
          </div>

          <div className='mb-6'>
            <FormField 
              label="Address"
              onChange={e => handleChange('address', e.target.value)}
              placeholder="Enter address here..."
              error={errors.address}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <FormField 
              label="Email"
              onChange={e => handleChange('email', e.target.value)}
              placeholder="Enter email here..."
              error={errors.email}
            />
            <FormField 
              label="Contact Number"
              onChange={e => handleChange('contactNumber', e.target.value)}
              placeholder="Enter contact number here..."
              error={errors.contactNumber}
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <FormSelect
              label="Branch"
              onChange={(value) => setData(prev => ({...prev, branchLocation: value }))}
              options={branchOptions}
              placeholder="Select branch..."
            />
            
            <FormSelect
              label="Role"
              onChange={(value) => setData(prev => ({...prev, employeeRole: value }))}
              options={roleOptions}
              placeholder="Select role..."
            />

            <FormSelect
              label="Shift"
              onChange={(value) => setData(prev => ({...prev, employeeShift: value }))}
              options={employeeShiftOptions}
              placeholder="Select shift..."
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
      />
    </>
  );
};

export default CreateAccountModal;