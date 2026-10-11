import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import EditUserDetailsModal from './EditUserDetailModal'; 
import EditAccountPasswordModal from './EditAccountPasswordModal'; 
import { Button } from "@/components/ui/button"; 

const UserSettingsCard = ({ user }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Robust ID extraction matching your auth state
      const targetId = user?.employee_id || user?.id || user?.employeeId || user?.nameid;

      if (!targetId) {
        console.error("No valid user ID found in session.");
        setIsLoading(false); // Stop loading if no ID is found
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/Employees/${targetId}`, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setProfileData(result.data || result); 
        } else {
          console.error("GET Profile returned a 404/Error. Check the fetch URL.");
        }
      } catch (error) {
        console.error("Failed to fetch profile details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleSaveProfile = (updatedFields) => {
    setProfileData(prevData => ({
      ...prevData,
      ...updatedFields
    }));
  };

  const profile = {
    firstName: profileData?.first_name || 'N/A',
    middleName: profileData?.middle_name || 'N/A',
    lastName: profileData?.last_name || 'N/A',
    address: profileData?.address || 'N/A',
    email: profileData?.email || user?.email || 'N/A',
    contactNo: profileData?.contact_number || 'N/A',
    branch: profileData?.branch_display_id || user?.branchId || 'N/A',
    role: profileData?.employee_role?.toUpperCase() || user?.trueRole?.toUpperCase() || 'N/A',
    profilePic: profileData?.employee_image_url || null
  };

  if (isLoading) {
    return <div className="p-8 font-montserrat text-muted-foreground">Loading profile data...</div>;
  }

  return (
    <>
      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-8 font-montserrat max-w-2xl">
        
        <div className="flex items-center gap-6 mb-10">
          <div className="h-24 w-24 rounded-full border-2 border-border flex items-center justify-center overflow-hidden bg-muted shrink-0">
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User size={48} className="text-muted-foreground stroke-[1.5]" />
            )}
          </div>
          
          <div className="flex-grow">
            <h3 className="text-[22px] font-bold text-foreground tracking-tight">Profile picture</h3>
            <p className="text-sm text-muted-foreground mt-0.5">PNG, JPEG under 15 MB</p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <Button>
              Upload new picture
            </Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              Remove picture
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-10">
          <div>
            <p className="text-sm text-muted-foreground mb-1">First name:</p>
            <p className="font-bold text-foreground">{profile.firstName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Middle name:</p>
            <p className="font-bold text-foreground">{profile.middleName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last name:</p>
            <p className="font-bold text-foreground">{profile.lastName}</p>
          </div>

          <div className="col-span-3">
            <p className="text-sm text-muted-foreground mb-1">Address:</p>
            <p className="font-bold text-foreground uppercase">{profile.address}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Email:</p>
            <p className="font-bold text-foreground truncate pr-4">{profile.email}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground mb-1">Contact no.:</p>
            <p className="font-bold text-foreground">{profile.contactNo}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Branch:</p>
            <p className="font-bold text-foreground">{profile.branch}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-muted-foreground mb-1">Role:</p>
            <p className="font-bold text-foreground uppercase">{profile.role}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            className="w-40 font-bold"
          >
            Edit details
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-48 font-bold border-destructive text-destructive hover:bg-destructive/10"
          >
            Update Password
          </Button>
        </div>
      </div>

      <EditUserDetailsModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
        profileData={profileData} 
        onSave={handleSaveProfile} 
      />
      
      <EditAccountPasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        user={user} 
      />
    </>
  );
};

export default UserSettingsCard;