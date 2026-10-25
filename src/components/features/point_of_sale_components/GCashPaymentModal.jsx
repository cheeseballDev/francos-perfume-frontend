import { Button } from "@/components/ui/button";
import { useState } from "react";
import ModalOverlay from "@/components/shared/ModalOverlay";

const GCashPaymentModal = ({ isOpen, onClose, onConfirmPayment, isProcessing = false }) => {
  const [referenceNumber, setReferenceNumber] = useState("");

  if (!isOpen) return null;

  const isValid = referenceNumber.trim().length > 0;

  const handleConfirm = () => {
    if (isValid) {
      onConfirmPayment({ method: "GCASH", referenceNumber: referenceNumber.trim() });
      setReferenceNumber("");
    }
  };

  const handleClose = () => {
    setReferenceNumber("");
    onClose();
  };

  return (
    <ModalOverlay onClose={handleClose} disabled={isProcessing} className="z-[110] bg-black/70 backdrop-blur-sm p-4">
      <div role="dialog" aria-modal="true" className="bg-card text-card-foreground rounded-md shadow-2xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative p-8">
        
        <div className="flex flex-col gap-8 mt-4 mb-8">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground font-medium text-sm tracking-widest uppercase">
              REFERENCE ID:
            </span>
                <input
                    type="text"
                    placeholder="Enter reference ID..."
                    value={referenceNumber}
                    maxLength="13"
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="flex-1 border border-input bg-transparent rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    autoFocus
                />
          </div>

        </div>

        <div className="flex justify-center">
          <Button
            variant="success"
            className="px-8 py-5 text-lg font-extrabold tracking-widest shadow-md"
            disabled={!isValid}
            onClick={handleConfirm}
          >
            CONFIRM PAYMENT
          </Button>
        </div>
        <button 
          onClick={handleClose}
          className="absolute top-2 right-4 text-muted-foreground hover:text-foreground text-xl font-bold"
        >
          ×
        </button>

      </div>
    </ModalOverlay>
  );
};

export default GCashPaymentModal;