import React, { useState, useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button"; 
import ConfirmDialog from "@/components/shared/ConfirmDialog"; // ADDED: Import ConfirmDialog

const EditUserDetailsModal = ({ isOpen, onClose, user, profileData, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    contactNo: '',
    address: '',
    email: '',
    branch: '',
    role: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState(null); // ADDED: State for alert dialog

  // Pre-fill the form using the fetched profileData, not the stripped-down user session
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        middleName: profileData?.middle_name || '',
        contactNo: profileData?.contact_number || '',
        address: profileData?.address || '',
        email: profileData?.email || user?.email || '',
        branch: profileData?.branch_display_id || user?.branchId || '',
        role: profileData?.employee_role?.toUpperCase() || user?.trueRole?.toUpperCase() || ''
      });
    }
  }, [isOpen, profileData, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // CALL 1: Update Profile Details
      const profilePayload = {
        branch_id: profileData?.branch_id || user?.branchId || 1, 
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middleName,
        contact_number: formData.contactNo,
        address: formData.address,
        employee_shift: profileData?.employee_shift || "Morning", 
        employee_image_url: profileData?.employee_image_url || "" 
      };

      const profileResponse = await fetch(`http://localhost:5000/api/Employees/updateProfile/${user.employee_id}`, { 
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${user?.accessToken}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(profilePayload)
      });

      if (!profileResponse.ok) throw new Error("Failed to update profile details.");

      // CALL 2: Update Auth Details (Email)
      if (formData.email !== (profileData?.email || user.email)) {
        const authPayload = {
          email: formData.email,
          employee_role: user.trueRole || "STAFF", 
          password_status: user.password_status || "active" 
        };

        const authResponse = await fetch(`http://localhost:5000/api/Employees/updateAuth/${user.employee_id}`, { 
          method: 'PUT',
          headers: { 
              'Authorization': `Bearer ${user?.accessToken}`,
              'Content-Type': 'application/json' 
          },
          body: JSON.stringify(authPayload)
        });

        if (!authResponse.ok) throw new Error("Profile updated, but email update failed.");
      }
      
      // Trigger success dialog and wait for user acknowledgment before closing
      setConfig({
        isAlert: true,
        title: "Success",
        description: "Account details updated successfully!",
        confirmVariant: "default",
        confirmText: "OK",
        onConfirm: () => {
          if (onSave) {
            onSave({
              first_name: formData.firstName,
              last_name: formData.lastName,
              middle_name: formData.middleName,
              contact_number: formData.contactNo,
              address: formData.address,
              email: formData.email
            });
          }
          setConfig(null);
          onClose();
        }
      });
      
    } catch (error) {
      // Trigger error dialog
      setConfig({
        isAlert: true,
        title: "Update Failed",
        description: error.message || "An error occurred while updating your account details.",
        confirmVariant: "destructive",
        confirmText: "Acknowledge",
        onConfirm: () => setConfig(null)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-montserrat animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-[550px] p-8 relative text-card-foreground">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Edit Account Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="First Name" 
              required
              className="border border-input bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              required
              className="border border-input bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={formData.lastName} 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Middle Name"
              className="border border-input bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={formData.middleName} 
              onChange={(e) => setFormData({...formData, middleName: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Contact No."
              className="border border-input bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={formData.contactNo} 
              onChange={(e) => setFormData({...formData, contactNo: e.target.value})}
            />
          </div>

          <input 
            type="text" 
            placeholder="Address"
            className="w-full border border-input bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            value={formData.address} 
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />

          <input 
            type="email" 
            placeholder="Email" 
            required
            className="w-full border border-input bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <select 
              disabled
              className="border border-input rounded-md p-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed appearance-none"
              value={formData.branch}
            >
              <option value={formData.branch}>{formData.branch || 'Select Branch'}</option>
            </select>
            
            <select 
              disabled
              className="border border-input rounded-md p-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed appearance-none"
              value={formData.role}
            >
              <option value={formData.role}>{formData.role || 'Select Role'}</option>
            </select>
          </div>

          <div className="flex justify-center gap-6 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose} 
              disabled={isSubmitting}
            >
              <span className="text-lg font-bold mr-2">✕</span> Discard Changes
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              <span className="text-lg font-bold mr-2">✓</span> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* ADDED: ConfirmDialog for error and success popups */}
      <ConfirmDialog
          isOpen={!!config}
          onClose={() => setConfig(null)}
          config={config}
      />
    </div>
  );
};

export default EditUserDetailsModal;