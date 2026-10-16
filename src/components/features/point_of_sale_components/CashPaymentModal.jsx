import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

const CashPaymentModal = ({ isOpen, onClose, grandTotal, onConfirmPayment }) => {
    const [amountReceived, setAmountReceived] = useState("");

    if (!isOpen) return null;

    const receivedNum = parseFloat(amountReceived) || 0;
    const change = Math.max(0, receivedNum - grandTotal);
    
    const isSufficient = receivedNum >= grandTotal;

    const handleConfirm = () => {
        if (isSufficient) {
            onConfirmPayment({ method: "CASH", amountPaid: receivedNum });
        }
    };

    const handleClose = () => {
        setAmountReceived("");
        onClose();
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === "") {
            setAmountReceived("");
            return;
        }

        if (Number(val) < 0 || Number(val) > 99999) {
            return;
        }

        const integerPart = val.split('.')[0];
        if (integerPart.length > 5) {
            return;
        }
        setAmountReceived(val);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative p-10">
            
            <button 
            onClick={handleClose} 
            className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
            >
            <X size={28} />
            </button>

            <div className="flex flex-col gap-8 mt-2 mb-10">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium text-sm tracking-widest uppercase">
                Total Amount:
                </span>
                <span className="text-[28px] font-extrabold text-foreground">
                ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium text-sm tracking-widest uppercase">
                Amount Received:
                </span>
                    <input
                        type="number"
                        placeholder="Enter amount..."
                        value={amountReceived}
                        onChange={handleAmountChange}
                        className="border border-input bg-transparent rounded-md px-4 py-2 text-xl font-bold text-foreground w-48 text-right focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        autoFocus
                    />
            </div>

            <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium text-sm tracking-widest uppercase">
                Change:
                </span>
                <span className={`text-[28px] font-extrabold ${receivedNum > 0 && !isSufficient ? 'text-destructive' : 'text-foreground'}`}>
                ₱{change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
            </div>

            <div className="flex justify-center">
            <Button
                variant="success"
                className="px-10 py-6 text-lg font-extrabold tracking-widest w-full max-w-[300px] shadow-md"
                disabled={!isSufficient}
                onClick={handleConfirm}
            >
                CONFIRM PAYMENT
            </Button>
            </div>

        </div>
        </div>
    );
};

export default CashPaymentModal;