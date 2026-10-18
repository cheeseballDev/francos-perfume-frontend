import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAccount } from "@/hooks/account_hooks/useAccount";
import { isValid, validateForm } from "@/utils/validationUtils";
import { Loader2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EditAccountPasswordModal from './EditAccountPasswordModal';

const INITIAL_FORM_STATE = {
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    email: '',
    contactNumber: '',
    branchLocation: '',
    employeeRole: '',
};

const userValidationSchema = {
    firstName: [isValid.required, isValid.maxLength(25), isValid.minLength(2), isValid.noNumbers],
    lastName: [isValid.required, isValid.maxLength(25), isValid.minLength(2), isValid.noNumbers],
    middleName: [isValid.maxLength(25), isValid.minLength(2), isValid.noNumbers],
    contactNumber: [isValid.phone]
};

const UserSettingsCard = ({ accountId }) => {
    const { fetchAccountDetails, updateAccount, updatePassword } = useAccount();
    const { toast } = useToast();
    
    const fileInputRef = useRef(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const [imagePreview, setImagePreview] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await fetchAccountDetails(accountId);
                setProfileData(data);
                setFormData({
                    firstName: data?.firstName || '',
                    middleName: data?.middleName || '',
                    lastName: data?.lastName || '',
                    address: data?.address || '',
                    email: data?.email || '',
                    contactNumber: data?.contactNumber || '',
                    branchLocation: data?.branchLocation || '',
                    employeeRole: data?.employeeRole || ''
                });
            } catch (error) {
                toast({
                    title: "Failed to get user profile",
                    description: `An error occurred while getting the details of the account.\n${error}`,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [accountId, fetchAccountDetails, toast]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            firstName: profileData?.firstName || '',
            middleName: profileData?.middleName || '',
            lastName: profileData?.lastName || '',
            address: profileData?.address || '',
            email: profileData?.email || '',
            contactNumber: profileData?.contactNumber || '',
            branchLocation: profileData?.branchLocation || '',
            employeeRole: profileData?.employeeRole || '',
        });
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        const validationErrors = validateForm(formData, userValidationSchema);
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSaving(true);
            await updateAccount(accountId, formData);
            setProfileData(prev => ({ ...prev, ...formData }));
            
            toast({
                title: "Success",
                description: "Profile details updated successfully.",
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Update Failed",
                description: `An error occurred while updating profile details.\n${error.response?.data}`,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTriggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a PNG or JPEG image.",
                variant: "destructive"
            });
            return;
        }

        const maxSize = 15 * 1024 * 1024;
        if (file.size > maxSize) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 15 MB.",
                variant: "destructive"
            });
            return;
        }

        setIsUploadingImage(true);

        setTimeout(() => {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setIsUploadingImage(false);
            
            toast({
                title: "Upload Successful",
                description: "Your profile picture has been updated (Simulated).",
                className: "bg-emerald-600 text-white border-emerald-700",
            });
            
            if (fileInputRef.current) fileInputRef.current.value = "";
        }, 1000);
    };

    const handleRemoveImage = () => {
        setIsUploadingImage(true);

        setTimeout(() => {
            setImagePreview(null);
            setProfileData(prev => ({ ...prev, employeeImageUrl: null }));
            setIsUploadingImage(false);

            toast({
                title: "Picture Removed",
                description: "Your profile picture has been removed (Simulated).",
            });
        }, 800);
    };

    if (isLoading) {
        return (
            <div className="p-8 font-montserrat text-muted-foreground flex items-center gap-2">
                <Loader2 className="animate-spin" /> Loading profile data...
            </div>
        );
    }

    const displayImage = imagePreview || profileData?.employeeImageUrl;

    return (
        <>
            <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-8 font-montserrat max-w-3xl">
                
                <div className="flex items-center gap-6 mb-10 pb-6 border-b border-border">
                    <div className="h-24 w-24 rounded-full border-2 border-border flex items-center justify-center overflow-hidden bg-muted shrink-0 relative group">
                        {isUploadingImage ? (
                            <Loader2 className="animate-spin text-muted-foreground" size={32} />
                        ) : displayImage ? (
                            <img src={displayImage} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <User size={48} className="text-muted-foreground stroke-[1.5]" />
                        )}
                    </div>
                    
                    <div className="flex-grow">
                        <h3 className="text-[22px] font-bold text-foreground tracking-tight">Profile picture</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">PNG, JPEG under 15 MB</p>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/png, image/jpeg" 
                        className="hidden" 
                    />
                    
                    <div className="flex flex-col gap-3 shrink-0">
                        <Button 
                            onClick={handleTriggerImageUpload} 
                            variant="outline" 
                            disabled={isUploadingImage}
                        >
                            {isUploadingImage ? "Uploading..." : "Upload new picture"}
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleRemoveImage}
                            disabled={isUploadingImage || !displayImage}
                        >
                            Remove picture
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">First name</label>
                            {isEditing ? (
                                <Input 
                                    name="firstName"
                                    maxLength={25}
                                    value={formData.firstName} 
                                    onChange={handleInputChange} 
                                />
                            ) : (
                                <p className="font-bold text-foreground py-2">{profileData?.firstName || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Middle name</label>
                            {isEditing ? (
                                <Input 
                                    name="middleName" 
                                    maxLength={25}
                                    value={formData.middleName} 
                                    onChange={handleInputChange} 
                                />
                            ) : (
                                <p className="font-bold text-foreground py-2">{profileData?.middleName || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Last name</label>
                            {isEditing ? (
                                <Input 
                                    name="lastName" 
                                    maxLength={25}
                                    value={formData.lastName} 
                                    onChange={handleInputChange} 
                                />
                            ) : (
                                <p className="font-bold text-foreground py-2">{profileData?.lastName || 'N/A'}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Address</label>
                        {isEditing ? (
                            <Input 
                                name="address" 
                                maxLength={50}
                                value={formData.address} 
                                onChange={handleInputChange} 
                            />
                        ) : (
                            <p className="font-bold text-foreground uppercase py-2">{profileData?.address || 'N/A'}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                            {isEditing ? (
                                <Input 
                                    name="email" 
                                    maxLength={30}
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                />
                            ) : (
                                <p className="font-bold text-foreground py-2">{profileData?.email || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Contact number</label>
                            {isEditing ? (
                                <Input 
                                    name="contactNumber" 
                                    maxLength={30}
                                    value={formData.contactNumber} 
                                    onChange={handleInputChange} 
                                />
                            ) : (
                                <p className="font-bold text-foreground py-2">{profileData?.contactNumber || 'N/A'}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Branch</label>
                            <p className="font-bold text-foreground py-2">{profileData?.branchLocation || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Role</label>
                            <p className="font-bold text-foreground uppercase py-2">{profileData?.employeeRole || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-border">
                    {isEditing ? (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={handleCancelEdit} 
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSaveEdit} 
                                disabled={isSaving}
                                className="min-w-[120px]"
                            >
                                {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                onClick={() => setIsEditing(true)}
                                className="w-40 font-bold"
                            >
                                Edit details
                            </Button>
                            <Button 
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                Update Password
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <EditAccountPasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)}
                user={formData}
                accountId={accountId}
                updatePassword={updatePassword}
            />
        </>
    );
};

export default UserSettingsCard;