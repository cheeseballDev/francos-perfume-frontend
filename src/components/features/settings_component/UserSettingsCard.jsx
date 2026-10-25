import { ImageUpload } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAccount } from "@/hooks/account_hooks/useAccount";
import { deleteImage } from "@/services/ImageService";
import { isValid, validateForm } from "@/utils/validationUtils";
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    employeeImageUrl: '',
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

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState(INITIAL_FORM_STATE);
    const [originalImageUrl, setOriginalImageUrl] = useState(null);
    const [isRemovingImage, setIsRemovingImage] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await fetchAccountDetails(accountId);
                setProfileData(data);
                setData({
                    firstName: data?.firstName || '',
                    middleName: data?.middleName || '',
                    lastName: data?.lastName || '',
                    address: data?.address || '',
                    email: data?.email || '',
                    contactNumber: data?.contactNumber || '',
                    branchLocation: data?.branchLocation || '',
                    employeeRole: data?.employeeRole || '',
                    employeeImageUrl: data?.employeeImageUrl || '',
                });

                setOriginalImageUrl(data.employeeImageUrl || null);
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

    const handleCancelEdit = () => {
        setData({
            firstName: profileData?.firstName || '',
            middleName: profileData?.middleName || '',
            lastName: profileData?.lastName || '',
            address: profileData?.address || '',
            email: profileData?.email || '',
            contactNumber: profileData?.contactNumber || '',
            branchLocation: profileData?.branchLocation || '',
            employeeRole: profileData?.employeeRole || '',
            employeeImageUrl: profileData?.employeeImageUrl || '',
        });
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        const validationErrors = validateForm(data, userValidationSchema);
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSaving(true);

            if (isRemovingImage && originalImageUrl) {
                await deleteImage(originalImageUrl, "account-profile-pictures");
            }

            await updateAccount(accountId, data);
            setProfileData(prev => ({ ...prev, ...data }));
            
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

    const handleImageChange = (url) => {
        if (!url && originalImageUrl) {
            setIsRemovingImage(true);
        } else if (url) {
            setIsRemovingImage(false);
        }
        handleChange('employeeImageUrl', url);
    };


    if (isLoading) {
        return (
            <div className="p-8 font-montserrat text-muted-foreground flex items-center gap-2">
                <Loader2 className="animate-spin" /> Loading profile data...
            </div>
        );
    }

    return (
        <>
            <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-8 font-montserrat max-w-3xl">
                
                <div className="py-4 border-b border-border">
                    <ImageUpload
                        value={data.employeeImageUrl}
                        onChange={handleImageChange}
                        bucket="account-profile-pictures"
                        imageText='User Image'
                        isEditing={isEditing}
                        aspect={1}
                        //className=""
                    />
                </div>

                <div className="space-y-6 mb-10">
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">First name</label>
                            {isEditing ? (
                                <Input 
                                    name="firstName"
                                    maxLength={25}
                                    value={data.firstName || ''} 
                                    onChange={handleNameChange} 
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
                                    value={data.middleName || ''} 
                                    onChange={handleNameChange} 
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
                                    value={data.lastName || ''} 
                                    onChange={handleNameChange} 
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
                                value={data.address} 
                                onChange={handleChange} 
                                error={errors.address}
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
                                    value={data.email} 
                                    onChange={handleChange} 
                                    error={errors.email}
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
                                    value={data.contactNumber} 
                                    onChange={e => {
                                            const numericString = e.target.value.replace(/[^\d+]/g, '');
                                            handleChange('contactNumber', numericString);
                                        }}
                                    placeholder="E.g 09123456789"
                                    error={errors.contactNumber}
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
                            >
                                Edit details
                            </Button>
                            <Button 
                                variant="destructive"
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
                user={data}
                accountId={accountId}
                updatePassword={updatePassword}
            />
        </>
    );
};

export default UserSettingsCard;