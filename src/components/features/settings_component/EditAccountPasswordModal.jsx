import ConfirmDialog from "@/components/shared/ConfirmDialog"; // ADDED: Import ConfirmDialog
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from 'lucide-react';
import { useState } from 'react';

const EditAccountPasswordModal = ({ isOpen, onClose, user }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState(null); // ADDED: State for alert dialog

  if (!isOpen) return null;

  const targetId = user?.employee_id || user?.id || user?.employeeId || user?.nameid;

  const checkNameCondition = () => {
    if (password.length === 0) return false;
    const passLower = password.toLowerCase();
    const first = user?.first_name?.toLowerCase();
    const last = user?.last_name?.toLowerCase();
    
    if (first && passLower.includes(first)) return false;
    if (last && passLower.includes(last)) return false;
    return true;
  };

  const conditions = {
    hasNoName: checkNameCondition(),
    hasMinLength: password.length >= 12,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[#.\-?!@$%^&*]/.test(password),
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  const canSubmit = Object.values(conditions).every(Boolean) && passwordsMatch;

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!targetId) {
        setConfig({
            isAlert: true,
            title: "Authentication Error",
            description: "Could not find your User ID in the authentication state. Please log out and log back in.",
            confirmVariant: "destructive",
            confirmText: "Acknowledge",
            onConfirm: () => setConfig(null)
        });
        return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/Employees/updatePassword/${targetId}`, { 
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${user?.accessToken}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
            new_password: password // Matches the UpdatePasswordDTO in C# exactly
        })
      });

      if (!response.ok) throw new Error(await response.text());
      
      setConfig({
          isAlert: true,
          title: "Success",
          description: "Password updated successfully.",
          confirmVariant: "default",
          confirmText: "OK",
          onConfirm: () => {
              setConfig(null);
              handleClose();
          }
      });
    } catch (error) {
      setConfig({
          isAlert: true,
          title: "Update Failed",
          description: error.message || "An error occurred while updating your password.",
          confirmVariant: "destructive",
          confirmText: "Acknowledge",
          onConfirm: () => setConfig(null)
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getConditionClass = (isMet) => {
    return isMet ? "text-green-500 font-medium transition-colors" : "text-destructive transition-colors";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-montserrat animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-[500px] p-8 relative text-card-foreground">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Edit Account Password</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Password:</label>
            <input 
              type="password" 
              placeholder="Enter your password here..." 
              required
              className="w-full border border-input bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Confirm password:</label>
            <input 
              type="password" 
              placeholder="Confirm your password" 
              required
              className={`w-full border bg-background rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground transition-colors ${
                confirmPassword.length > 0 && !passwordsMatch ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-destructive mt-1">Passwords do not match.</p>
            )}
          </div>

          {/* VALIDATION CHECKLIST */}
          <div className="pt-2">
            <p className="text-[15px] font-bold text-foreground mb-2">Password conditions (MUST HAVE):</p>
            <ul className="text-sm space-y-1.5 ml-4">
              <li className={getConditionClass(conditions.hasNoName)}>Must not include your name</li>
              <li className={getConditionClass(conditions.hasMinLength)}>12 characters minimum</li>
              <li className={getConditionClass(conditions.hasUpper)}>Include uppercase letter</li>
              <li className={getConditionClass(conditions.hasLower)}>Include lowercase letter</li>
              <li className={getConditionClass(conditions.hasNumber)}>Include number</li>
              <li className={getConditionClass(conditions.hasSpecial)}>Include a special character: (#.-?!@$%^&*)</li>
            </ul>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-6 pt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose} 
              disabled={isSubmitting}
            >
              <span className="text-lg font-bold mr-2">✕</span> Discard Changes
            </Button>
            <Button 
              type="submit" 
              disabled={!canSubmit || isSubmitting}
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

export default EditAccountPasswordModal;