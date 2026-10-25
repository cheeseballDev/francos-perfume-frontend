/**
 * Handler for a Radix <DialogContent>'s onPointerDownOutside / onEscapeKeyDown.
 * Radix closes the dialog on an outside click by default; this only steps in when needed:
 *
 * - isBusy: keep the dialog open (saving, uploading, importing).
 * - isDirty + onDirty: keep it open and call onDirty (e.g. ask "Discard changes?").
 */
export const guardDismiss = ({ isBusy = false, isDirty = false, onDirty } = {}) => (event) => {
    if (isBusy) {
        event.preventDefault();
        return;
    }
    if (isDirty && onDirty) {
        event.preventDefault();
        onDirty();
    }
};

// Shared config for the existing <ConfirmDialog>
export const discardChangesConfig = (onDiscard) => ({
    title: "Discard changes?",
    description: "You have unsaved changes. If you close this window now, they will be lost.",
    confirmText: "Discard",
    cancelText: "Keep editing",
    confirmVariant: "destructive",
    onConfirm: onDiscard,
});
