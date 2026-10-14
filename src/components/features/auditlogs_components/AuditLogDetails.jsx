import DetailItem from '@/components/shared/DetailItem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateTimeForTable } from '@/utils/formattingUtils';

const AuditLogDetails = ({ isOpen, onClose, selectedAuditLog }) => {
    if (!isOpen || !selectedAuditLog) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Audit Log Details</DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-6">

                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Audit Log ID" value={selectedAuditLog.logDisplayId || "N/A"}/>
                        <DetailItem 
                            label="Date and Time" 
                            value={selectedAuditLog.logTimestamp ? formatDateTimeForTable(selectedAuditLog.logTimestamp) : "N/A"}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <DetailItem label="Employee Display ID" value={selectedAuditLog.employeeDisplayId || "N/A"}/>
                        <DetailItem label="Employee Name" value={selectedAuditLog.employeeName || "N/A"}/>
                        <DetailItem label="Branch Location" value={selectedAuditLog.branchLocation || "N/A"}/>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Module" value={selectedAuditLog.logModule || "N/A"} />
                        <DetailItem label="Action" value={selectedAuditLog.logAction || "N/A"} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuditLogDetails;