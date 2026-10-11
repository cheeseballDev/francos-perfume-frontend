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

const ConfirmDialog = ({ isOpen, onClose, config, isLoading }) => {
    if (!config) return null;

    const handleConfirm = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (config.onConfirm) {
                await config.onConfirm();
            }
            onClose();
        } catch (error) {
            console.error("Confirmation action failed:", error);
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
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
            onOpenChange={(open) => !open && onClose()}
        >
            <AlertDialogContent>

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
                                className="w-full mt-0 border-input bg-background hover:bg-muted text-foreground"
                            >
                                {config.cancelText || "Cancel"}
                            </AlertDialogCancel>
                        )}

                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={`w-full font-bold ${getButtonColor(confirmVariant)}`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : (config.confirmText || (isAlertOnly ? "OK" : "Confirm"))}
                        </AlertDialogAction>
                    </div>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDialog;