import { ImageUpload } from '@/components/shared';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { deleteImage } from '@/services/ImageService';
import { discardChangesConfig, guardDismiss } from "@/utils/modalUtils";
import { isValid, validateForm } from "@/utils/validationUtils";
import { useEffect, useState } from 'react';
import { useAuth } from "../../../auth/UseAuth";

const getAccountFormData = (account) => ({
    firstName: account?.firstName || "",
    lastName: account?.lastName || "",
    middleName: account?.middleName || "",
    contactNumber: account?.contactNumber || "",
    address: account?.address || "",
    email: account?.email || "",
    branchLocation: account?.branchLocation || "",
    employeeRole: account?.employeeRole || "",
    employeeShift: account?.employeeShift || "",
    employeeImageUrl: account?.employeeImageUrl || ""
});

const accountValidationSchema = {
    firstName: [isValid.required, isValid.maxLength(25), isValid.minLength(2), isValid.noNumbers],
    lastName: [isValid.required, isValid.maxLength(25), isValid.minLength(2), isValid.noNumbers],
    address: [isValid.minLength(3)],
    email: [isValid.required, isValid.email],
    contactNumber: [isValid.phone],
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

const EditAccountModal = ({ isOpen, onClose, selectedAccount, filterOptions = [], updateAccount, setSelectedAccount }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [config, setConfig] = useState(null);
    const [data, setData] = useState(() => getAccountFormData(selectedAccount));
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isManager = user?.trueRole === 'MANAGER';
    const [originalImageUrl, setOriginalImageUrl] = useState(selectedAccount?.employeeImageUrl || null);
    const [isRemovingImage, setIsRemovingImage] = useState(false);

    useEffect(() => {
        if (isOpen && selectedAccount) {
            setData(getAccountFormData(selectedAccount));
            setErrors({});
        }
    }, [isOpen, selectedAccount]);

    if (!isOpen) return null;

    const isDirty = !!data && JSON.stringify(data) !== JSON.stringify(getAccountFormData(selectedAccount));
    const dismissGuard = guardDismiss({
        isBusy: isSubmitting,
        isDirty,
        onDirty: () => setConfig(discardChangesConfig(onClose)),
    });

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
        const currentUserRank = ROLE_RANKS[user?.trueRole?.toUpperCase()] || 0;

        return targetRoleRank < currentUserRank;
    });

    const employeeShiftOptions = employeeShiftOptionData.filter(
        (option) => option.value !== "" && option.value !== "__all__"
    );

    const handleNameChange = (field, value) => {
        const validPattern = /^[a-zA-ZñÑàáâãäåæçèéêëìíîïðòóôõöùúûüýÿ\s'-]*$/;

        if (value === '' || validPattern.test(value)) {
            handleChange(field, value);
        }
    };


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
        title: "Are you sure you want to save changes for this account?",
        description: "The user of this account will be notified of the changes made to their account.",
        confirmText: "Save Changes",
        onConfirm: async () => {
            try {
                setIsSubmitting(true);
                
                if (isRemovingImage && originalImageUrl) {
                    await deleteImage(originalImageUrl, "account-profile-pictures");
                }

                
                await updateAccount(selectedAccount.employeeId, data);

                toast({
                    title: "Success",
                    description: "Account updated successfully.",
                });

                onClose();
            } catch (error) {
                toast({
                    title: "Update Failed",
                    description: `An error occurred while updating the account.\n${error}`,
                    variant: "destructive",
                });
            } finally {
                setIsSubmitting(false);
                setConfig(null);
                setData(null);
                setSelectedAccount(null);
            }
        } 
        })
    }

    const handleImageChange = (url) => {
        if (!url && originalImageUrl) {
            setIsRemovingImage(true);
        } else if (url) {
            setIsRemovingImage(false);
        }
        handleChange('employeeImageUrl', url);
    };

    return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
            className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
            onPointerDownOutside={dismissGuard}
            onEscapeKeyDown={dismissGuard}
         >
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>

            <div className="py-4 border-b border-border">
                <ImageUpload
                    value={data.employeeImageUrl}
                    onChange={handleImageChange}
                    bucket="account-profile-pictures"
                    imageText='User Image'
                    aspect={1}
                    //className=""
                />
            </div>

            <div className='grid grid-cols-3 gap-4 py-4'>

            <FormField 
                label="First Name"
                value={data.firstName}
                maxLength={25}
                onChange={e => handleNameChange('firstName', e.target.value)}
                placeholder="Enter first name here..."
                error={errors.firstName}
            />

            <FormField 
                label="Middle Name"
                value={data.middleName}
                maxLength={25}
                onChange={e => handleNameChange('middleName', e.target.value)}
                placeholder="Enter middle name here..."
                error={errors.middleName}
            />

            <FormField 
                label="Last Name"
                value={data.lastName}
                maxLength={25}
                onChange={e => handleNameChange('lastName', e.target.value)}
                placeholder="Enter last name here..."
                error={errors.lastName}
            />
          </div>

          <div className='mb-6'>
            <FormField 
              label="Address"
              value={data.address}
              maxLength={50}
              onChange={e => handleChange('address', e.target.value)}
              placeholder="Enter address here..."
              error={errors.address}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <FormField 
              label="Email"
              maxLength={30}
              value={data.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="Enter email here..."
              error={errors.email}
            />
            <FormField 
              label="Contact Number"
              maxLength={11}
              value={data.contactNumber}
              onChange={e => {
                    const numericString = e.target.value.replace(/[^\d+]/g, '');
                    handleChange('contactNumber', numericString);
                }}
              placeholder="E.g 09123456789"
              error={errors.contactNumber}
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <FormSelect
              label="Branch"
              value={data.branchLocation}
              onChange={(value) => setData(prev => ({...prev, branchLocation: value }))}
              options={branchOptions}
              placeholder="Select branch..."
              disabled={isManager}
            />
            
            <FormSelect
              label="Role"
              value={data.employeeRole}
              onChange={(value) => setData(prev => ({...prev, employeeRole: value }))}
              options={roleOptions}
              placeholder="Select role..."
              disabled={isManager}
            />

            <FormSelect
              label="Shift"
              value={data.employeeShift}
              onChange={(value) => setData(prev => ({...prev, employeeShift: value }))}
              options={employeeShiftOptions}
              placeholder="Select shift..."
              disabled={isManager}
            />

          </div>

          <div className="grid grid-cols-2 gap-6 mb-2">
            <Button 
              onClick={onClose}
              variant="outline"
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

export default EditAccountModal;