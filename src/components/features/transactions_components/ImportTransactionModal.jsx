import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { postUploadExcel } from '@/services/TransactionService';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { guardDismiss } from '@/utils/modalUtils';
import { useRef, useState } from 'react';

const ImportTransactionModal = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [config, setConfig] = useState(null);

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;

        const isExcel = 
            selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            selectedFile.type === 'application/vnd.ms-excel' ||
            selectedFile.name.endsWith('.xlsx') ||
            selectedFile.name.endsWith('.xls');

        if (!isExcel) {
            toast({
                title: 'Invalid File',
                description: 'Please upload an Excel file (.xlsx or .xls)',
                variant: 'destructive',
            });
            return;
        }

        setFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        handleFileSelect(dropped);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleClickUpload = () => fileInputRef.current?.click();

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = () => {
        if (!file) return;

        setConfig({
            title: 'Import Transactions?',
            description: `This will import transactions from "${file.name}". Duplicate entries may be created if the file was already imported.`,
            confirmText: 'Import',
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await postUploadExcel(file);
                    toast({
                        title: 'Import Successful',
                        description: 'Transactions have been imported successfully.',
                    });
                    setFile(null);
                    onClose();
                } catch (error) {
                    toast({
                        title: 'Import Failed',
                        description: `An error occurred while importing.\n${error.response?.data}`,
                        variant: 'destructive',
                        duration: 5000
                    });
                } finally {
                    setIsSubmitting(false);
                }
            },
            onCancel: () => {
                setIsSubmitting(false);
                onClose(); 
            }
        });
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setFile(null);
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent
                    className="max-w-md font-montserrat"
                    onPointerDownOutside={guardDismiss({ isBusy: isSubmitting })}
                    onEscapeKeyDown={guardDismiss({ isBusy: isSubmitting })}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            Import Transactions
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Upload an Excel file (.xlsx or .xls) to import transaction records.
                        </p>

                        <div
                            onClick={handleClickUpload}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : file
                                        ? 'border-emerald-400 bg-emerald-50/50'
                                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                            />

                            {file ? (
                                <>
                                    <div className="p-3 bg-emerald-100 rounded-full">
                                        <FileSpreadsheet size={28} className="text-emerald-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-foreground text-sm">{file.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-muted rounded-full">
                                        <Upload size={28} className="text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-foreground text-sm">
                                            {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Supports .xlsx and .xls files
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!file || isSubmitting}
                        >
                            {isSubmitting ? 'Importing...' : 'Import'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                isLoading={isSubmitting}
                config={config}
            />
        </>
    );
};

export default ImportTransactionModal;