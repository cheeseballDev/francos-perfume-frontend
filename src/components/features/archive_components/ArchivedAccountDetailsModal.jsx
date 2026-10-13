import ConfirmDialog from '@/components/shared/ConfirmDialog';
import DetailItem from '@/components/shared/DetailItem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTimeForTable } from '@/utils/formattingUtils';
import { useState } from 'react';

const ArchivedAccountDetailsModal = ({ isOpen, onClose, selectedArchivedAcccount, restoreArchivedAccount, setSelectedArchivedAccount }) => {
    const { toast } = useToast();

    const [config, setConfig] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !selectedArchivedAcccount) return null;

    const handleRestoreArchive = () => {
        setConfig({
        title: "Are you sure you want to restore this account?",
        description:
            "The user of this account will be able to login again.",
        confirmText: "Restore Account",
        onConfirm: async () => {
            try {
                setIsSubmitting(true);
                await restoreArchivedAccount(selectedArchivedAcccount.accountArchiveId);

                toast({
                    title: "Success",
                    description: "Account restored successfully.",
                })

            } catch (error) {
                toast({
                    title: "Update Failed",
                    description: `An error occurred while restoring the account.\n${error}`,
                    variant: "destructive",
                });
            } finally {
                setIsSubmitting(false);
                setConfig(null);
                setSelectedArchivedAccount(null);
            }
        },
        });
    }


    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Archive Details</DialogTitle>
                    </DialogHeader>

                    <div className="p-4 space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                            <DetailItem label="Employee ID" value={selectedArchivedAcccount.employeeDisplayId || "N/A"}/>
                            <DetailItem label="Archived By" value={selectedArchivedAcccount.archivedBy || "N/A"}/>
                            <DetailItem 
                                label="Date and Time Archived" 
                                value={formatDateTimeForTable(selectedArchivedAcccount.dateArchived) || "N/A"}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <DetailItem label="First Name" value={selectedArchivedAcccount.firstName || "N/A"} />
                            <DetailItem label="Middle Name" value={selectedArchivedAcccount.middleName || "N/A"}/>
                            <DetailItem label="Last Name" value={selectedArchivedAcccount.lastName || "N/A"} />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <DetailItem label="Email" value={selectedArchivedAcccount.email || "N/A"}/>
                            <DetailItem label="Role" value={selectedArchivedAcccount.employeeRole || "N/A"} />
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleRestoreArchive}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Restoring..." : "Restore Account"}
                    </Button>

                    
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

export default ArchivedAccountDetailsModal;