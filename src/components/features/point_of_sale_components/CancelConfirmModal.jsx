import { Button } from "@/components/ui/button";
import ModalOverlay from "@/components/shared/ModalOverlay";

const CancelConfirmModal = ({ isOpen, onConfirm, onClose }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose} className="z-[100] bg-black/60 backdrop-blur-sm p-4">
            <div role="dialog" aria-modal="true" className="bg-card border border-border rounded-xl shadow-2xl w-[400px] p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-6">Cancel current order?</h3>
            <div className="flex gap-4 justify-center">
                <Button variant="destructive" className="px-8" onClick={onConfirm}>Yes</Button>
                <Button variant="outline" onClick={onClose}>No</Button>
            </div>
            </div>
        </ModalOverlay>
    );
}

export default CancelConfirmModal;