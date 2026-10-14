import { useAuth } from "@/auth/UseAuth";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DetailItem from "@/components/shared/DetailItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatLabel } from "@/utils/formattingUtils";
import { Archive, Edit, KeyRound, MinusSquareIcon, PlusSquareIcon } from "lucide-react";
import { useState } from "react";

const AccountInfoModal = ({
    isOpen,
    onClose,
    selectedAccount,
    archive,
    toggleStatus,
    resetPassword,
    setIsEditAccountModalOpen,
}) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [config, setConfig] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !selectedAccount) return null;

    const isManager = user?.trueRole === "MANAGER";
    const accountId = selectedAccount.employeeId;
    const isActive = selectedAccount?.status === "ACTIVE";

    const handleEditAccount = () => {
        setIsEditAccountModalOpen(true);
        onClose();
    };

    const handleResetPassword = () => {
        setConfig({
        title: "Are you sure you want to reset the password for this account?",
        description:
            "The user of this account will be logged out and an email will be sent including their one-time generated password.",
        confirmText: "Reset Password",
        onConfirm: async () => {
            try {
                setIsSubmitting(true);
                await resetPassword(accountId);

                toast({
                    title: "Success",
                    description: "Account password reset successfully.",
                });

                onClose();

                } catch (error) {
                    toast({
                        title: "Reset Password Failed",
                        description: `An error occurred while resetting the password of the account.\n${error}`,
                        variant: "destructive",
                    });   

                } finally {
                    setIsSubmitting(false);
                    setConfig(null);

                }
            } 
        });
    };

    const handleToggleStatus = () => {
        const text = isActive ? "deactivate" : "activate";
        setConfig({
        title: `Are you sure you want to ${text} this account?`,
        description: isActive
            ? "This account will no longer be able to log in."
            : "This account will regain access to the system.",
        confirmText: `${isActive ? "Deactivate" : "Activate"} Account`,
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await toggleStatus(accountId);

                    toast({
                        title: "Success",
                        description: isActive
                            ? "Account successfully deactivated."
                            : "Account successfully reactivated.",
                    });

                    onClose();

                } catch (error) {
                    toast({
                        title: "Reset Password Failed",
                        description: isActive 
                        ? `An error occurred while deactivating the account.\n${error}`
                        : `An error occurred while reactivating the account.\n${error}`,
                        variant: "destructive",
                    });

                } finally {
                    setIsSubmitting(false);
                    setConfig(null);
                }
            },
        });
    };

    const handleArchiveAccount = () => {
        setConfig({
        title: "Are you sure you want to archive this account?",
        description: "This account will no longer exist in the accounts table.",
        confirmText: "Archive Account",
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await archive(accountId);
                    
                    toast({
                        title: "Success",
                        description: "Account archived successfully.",
                    });

                    onClose();

                } catch (error) {
                    toast({
                        title: "Account Archiving Failed",
                        description: `An error occurred while archiving the account.\n${error}`,
                        variant: "destructive",
                    });
                    
                } finally {
                    setIsSubmitting(false);
                    setConfig(null);
                }
            },
        });
    };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>

          <div className="p-8">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <DetailItem label="First name" value={selectedAccount.firstName || "N/A"} />
              <DetailItem label="Middle name" value={selectedAccount.middleName || "N/A"} />
              <DetailItem label="Last name" value={selectedAccount.lastName || "N/A"} />
            </div>

            <div className="mb-6">
              <DetailItem label="Address" value={selectedAccount.address || "N/A"} uppercase={true} />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <DetailItem label="Email" value={selectedAccount.email || "N/A"} />
              <DetailItem label="Contact number" value={selectedAccount.contactNumber || "N/A"} />
            </div>

            <div className="grid grid-cols-4 gap-12 mb-8">
              <DetailItem label="Branch" value={formatLabel(selectedAccount.branchLocation) || "N/A"} />
              <DetailItem label="Role" value={formatLabel(selectedAccount.employeeRole) || "N/A"} />
              <DetailItem label="Status" value={formatLabel(selectedAccount.status) || "N/A"} />
              <DetailItem label="Shift" value={formatLabel(selectedAccount.employeeShift) || "N/A"} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button onClick={handleEditAccount}>
                <Edit />
                Edit Account
              </Button>

              <Button variant="destructive" onClick={handleResetPassword}>
                <KeyRound />
                Reset Password
              </Button>

              <Button
                variant={isActive ? "destructive" : "default"}
                onClick={handleToggleStatus}
              >
                {isActive ? <MinusSquareIcon /> : <PlusSquareIcon />}
                {isActive ? "Deactivate Account" : "Reactivate Account"}
              </Button>

              <Button
                variant="destructive"
                onClick={handleArchiveAccount}
                disabled={isManager}
              >
                <Archive />
                Archive Account
              </Button>
            </div>
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

export default AccountInfoModal;