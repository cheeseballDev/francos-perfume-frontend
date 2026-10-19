import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { isValid, validateForm } from "@/utils/validationUtils";
import { Loader2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const accountValidationSchema = {
    firstName: [isValid.required],
    lastName: [isValid.required],
    email: [isValid.required, isValid.email],
    address: [isValid.minLength(3)],
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
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const [config, setConfig] = useState(null);
    const [data, setData] = useState({});
    const [errors,setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image Simulation State
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
        const currentUserRank = ROLE_RANKS[localStorage.getItem("trueRole")] || 0;

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
        title: "Are you sure you want to create this account?",
        description: "This will make a new account for the employee.",
        confirmText: "Create Account",
        onConfirm: async () => {
            try {
                setIsSubmitting(true);
                await createAccount(data);

                toast({
                    title: "Success",
                    description: "Account created successfully.",
                });

                setData({});
                onClose();

            } catch (error) {
                toast({
                    title: "Creation Failed",
                    description:`An error occurred while creating the account.\n${error.response?.data}`,
                    variant: "destructive",
                    duration: 5000
                });

            } finally {
                setIsSubmitting(false);
                setConfig(null);
            }
        } 
        })
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
            toast({ title: "Upload Successful", description: "Profile picture attached (Simulated).", className: "bg-emerald-600 text-white border-emerald-700" });
            if (fileInputRef.current) fileInputRef.current.value = "";
        }, 1000);
    };

    const handleRemoveImage = () => {
        setIsUploadingImage(true);
        setTimeout(() => {
            setImagePreview(null);
            setIsUploadingImage(false);
            toast({ title: "Picture Removed", description: "Profile picture removed (Simulated)." });
        }, 800);
    };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
          </DialogHeader>

          {/* Image Upload Section */}
          <div className="flex items-center gap-6 py-4 border-b border-border">
              <div className="h-24 w-24 rounded-full border-2 border-border flex items-center justify-center overflow-hidden bg-muted shrink-0 relative">
                  {isUploadingImage ? (
                      <Loader2 className="animate-spin text-muted-foreground" size={32} />
                  ) : imagePreview ? (
                      <img src={imagePreview} alt="Profile Preview" className="h-full w-full object-cover" />
                  ) : (
                      <User size={40} className="text-muted-foreground stroke-[1.5]" />
                  )}
              </div>
              
              <div className="flex-grow">
                  <h3 className="text-[16px] font-bold text-foreground">Profile Picture</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">PNG, JPEG under 15 MB</p>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg" className="hidden" />
                  
                  <div className="flex gap-2">
                      <Button size="sm" onClick={handleTriggerImageUpload} variant="outline" disabled={isUploadingImage}>
                          {isUploadingImage ? "Uploading..." : "Upload Image"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleRemoveImage} disabled={isUploadingImage || !imagePreview}>
                          Remove
                      </Button>
                  </div>
              </div>
          </div>

          <div className='grid grid-cols-3 gap-4 py-4'>
            <FormField 
                label="First Name"
                value={data.firstName || ''}
                maxLength={25}
                onChange={e => handleNameChange('firstName', e.target.value)}
                placeholder="Enter first name here..."
                error={errors.firstName}
            />

            <FormField 
                label="Middle Name"
                value={data.middleName || ''}
                maxLength={25}
                onChange={e => handleNameChange('middleName', e.target.value)}
                placeholder="Enter middle name here..."
                error={errors.middleName}
            />

            <FormField 
                label="Last Name"
                value={data.lastName || ''}
                maxLength={25}
                onChange={e => handleNameChange('lastName', e.target.value)}
                placeholder="Enter last name here..."
                error={errors.lastName}
            />
          </div>

          <div className='mb-6'>
            <FormField 
                label="Address"
                value={data.address || ''}
                maxLength={50}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="Enter address here..."
                error={errors.address}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <FormField 
                label="Email"
                value={data.email || ''}
                maxLength={30}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="Enter email here..."
                error={errors.email}
            />
            <FormField 
                label="Contact Number"
                maxLength={11}
                value={data.contactNumber || ''}
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

          <div className="grid grid-cols-2 gap-6 mb-2">
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

export default CreateAccountModal;