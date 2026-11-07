import { useAuth } from "@/auth/UseAuth";
import SensitiveText from "@/components/shared/SensitiveText";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DetailItem from "@/components/shared/DetailItem";
import StatusBadge from "@/components/shared/StatusBadge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatLabel } from "@/utils/formattingUtils";
import { Archive, Edit, KeyRound, MinusSquareIcon, PlusSquareIcon } from "lucide-react";
import { useState } from "react";
import logo from '../../../assets/FrancoPerfumeLogo.png';
import { getAPIError } from "@/utils/apiErrorUtils";

const AccountInfoModal = ({
    isOpen,
    onClose,
    selectedAccount,
    archiveAccount,
    toggleAccountStatus,
    resetPassword,
    setIsEditAccountModalOpen,
    setSelectedAccount,
}) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [config, setConfig] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !selectedAccount) return null;

    const isManager = user?.trueRole === "MANAGER";
    const accountId = selectedAccount.employeeId;
    const isActive = selectedAccount?.status === "ACTIVE";
    const isSelectedAccountTheCurrentUser = accountId === user.employeeId;

    const handleEditAccount = () => {
        setIsEditAccountModalOpen(true);
        onClose();
    };

    const handleResetPassword = () => {
        setConfig({
        title: "Are you sure you want to reset the password for this account?",
        description:
            "The user of this account will be logged out and their password will be reset to the default password. They must set a new password the next time they log in.",
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
                setSelectedAccount(null);

                } catch (error) {
                    toast({
                        title: "Reset Password Failed",
                        description: `An error occurred while resetting the password of the account.\n${getAPIError(error)}`,
                        variant: "destructive",
                        duration: 5000
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
                    await toggleAccountStatus(accountId);

                    toast({
                        title: "Success",
                        description: isActive
                            ? "Account successfully deactivated."
                            : "Account successfully reactivated.",
                    });

                    onClose();
                    setSelectedAccount(null);

                } catch (error) {
                    toast({
                        title: "Reset Password Failed",
                        description: isActive 
                        ? `An error occurred while deactivating the account.\n${getAPIError(error)}`
                        : `An error occurred while reactivating the account.\n${getAPIError(error)}`,
                        variant: "destructive",
                        duration: 5000
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
                    await archiveAccount(accountId);
                    
                    toast({
                        title: "Success",
                        description: "Account archived successfully.",
                    });

                    onClose();
                    setSelectedAccount(null);

                } catch (error) {
                    toast({
                        title: "Account Archiving Failed",
                        description: `An error occurred while archiving the account.\n${getAPIError(error)}`,
                        variant: "destructive",
                        duration: 5000
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
            <div className="grid grid-cols-1 md:grid-cols-[13rem_1fr] gap-8 mb-8">

              <div className="flex flex-col items-center text-center gap-3 md:border-r md:border-border md:pr-8">
                <Avatar className="size-36 after:border-2">
                  <AvatarImage
                    src={selectedAccount.employeeImageUrl || undefined}
                    alt={logo}
                  />

                </Avatar>

                <div className="min-w-0 w-full">
                  <p className="text-sm text-muted-foreground mt-1 flex justify-center"><SensitiveText key={selectedAccount.employeeId} value={selectedAccount.email} /></p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-primary/40 bg-primary/20 text-xs font-semibold text-foreground">
                    {formatLabel(selectedAccount.employeeRole) || "No role"}
                  </span>
                  <StatusBadge status={selectedAccount.status} label={formatLabel(selectedAccount.status) || "Unknown"} />
                </div>

                <p className="text-xs text-muted-foreground">Employee ID: {selectedAccount.employeeId ?? "N/A"}</p>
              </div>

              <div className="flex flex-col gap-6 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <DetailItem label="First name" value={selectedAccount.firstName || "N/A"} />
                  <DetailItem label="Middle name" value={selectedAccount.middleName || "N/A"} />
                  <DetailItem label="Last name" value={selectedAccount.lastName || "N/A"} />
                </div>

                <DetailItem label="Address" value={selectedAccount.address || "N/A"} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <DetailItem label="Contact number" value={selectedAccount.contactNumber || "N/A"} />
                  <DetailItem label="Branch" value={formatLabel(selectedAccount.branchLocation) || "N/A"} />
                  <DetailItem label="Shift" value={formatLabel(selectedAccount.employeeShift) || "N/A"} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button 
                onClick={handleEditAccount}
                disabled={isSelectedAccountTheCurrentUser}
                >
                <Edit />
                Edit Account
              </Button>

              <Button 
                variant="destructive" 
                onClick={handleResetPassword}
                disabled={isSelectedAccountTheCurrentUser}
                >
                <KeyRound />
                Reset Password
              </Button>

              <Button
                variant={isActive ? "destructive" : "default"}
                onClick={handleToggleStatus}
                disabled={isSelectedAccountTheCurrentUser}
                className={isManager ? "col-span-2" : undefined}
              >
                {isActive ? <MinusSquareIcon /> : <PlusSquareIcon />}
                {isActive ? "Deactivate Account" : "Reactivate Account"}
              </Button>

              {!isManager && (
                <Button
                  variant="destructive"
                  onClick={handleArchiveAccount}
                  disabled={isSelectedAccountTheCurrentUser}
                >
                  <Archive />
                  Archive Account
                </Button>
              )}
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