import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ConfirmDialog = ({ isOpen, onClose, config, isLoading, className, overlayClassName }) => {
    const latestConfig = useRef(config);
    latestConfig.current = config;

    const runningRef = useRef(false);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        runningRef.current = false;
        setIsRunning(false);
    }, [config]);

    if (!config) return null;

    const isBusy = Boolean(isLoading) || isRunning;

    const handleConfirm = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (runningRef.current || isLoading) return;

        const confirmedConfig = config;
        runningRef.current = true;
        setIsRunning(true);
        try {
            if (confirmedConfig.onConfirm) {
                await confirmedConfig.onConfirm();
            }
            if (latestConfig.current === confirmedConfig) onClose();
        } catch (error) {
            console.error("Confirmation action failed:", error);
        } finally {
            if (latestConfig.current === confirmedConfig) {
                runningRef.current = false;
                setIsRunning(false);
            }
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isBusy) return;
        onClose();
    }

    const confirmVariant = config.confirmVariant || "destructive";
    const isAlertOnly = config.isAlert === true;

    const getButtonColor = (variant) => {
        switch (variant) {
            case "success":
                return "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent";
            case "destructive":
                return "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-transparent";
            case "default":
            default:
                return "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent";
        }
    };

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => !open && !isBusy && onClose()}
        >
            <AlertDialogContent
                className={className}
                overlayClassName={overlayClassName}
                onOverlayClick={() => !isBusy && onClose()}
                onEscapeKeyDown={(e) => isBusy && e.preventDefault()}
            >

                <AlertDialogHeader className="items-center text-center sm:items-center sm:text-center">
                    <AlertDialogTitle className="text-center justify-center font-bold">
                        {config.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-2 text-justify">
                        <span className="text-muted-foreground">{config.description || null}</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="w-full sm:flex-col sm:justify-stretch">
                    <div className={`grid ${isAlertOnly ? 'grid-cols-1' : 'grid-cols-2'} gap-6 mt-4 w-full`}>
                        {!isAlertOnly && (
                            <AlertDialogCancel
                                onClick={handleCancel}
                                disabled={isBusy}
                                className="w-full mt-0 border-input bg-background hover:bg-muted text-foreground"
                            >
                                {config.cancelText || "Cancel"}
                            </AlertDialogCancel>
                        )}

                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={`w-full font-bold ${getButtonColor(confirmVariant)}`}
                            disabled={isBusy}
                        >
                            {isBusy ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {config.loadingText || "Saving..."}
                                </span>
                            ) : (config.confirmText || (isAlertOnly ? "OK" : "Confirm"))}
                        </AlertDialogAction>
                    </div>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDialog;
