import React from "react";
import { X } from "lucide-react";

const CheckoutModal = ({ isOpen, onClose, grandTotal, onPaymentSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-[650px] overflow-hidden animate-fade-in relative flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border relative">
          <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-wide">
            TOTAL AMOUNT: 
            <span className="text-2xl font-extrabold text-foreground ml-3">
              ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors absolute right-6 top-1/2 -translate-y-1/2"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex p-8 gap-8">
          
          <div className="flex-1 bg-muted/50 text-foreground p-6 rounded-lg text-sm leading-relaxed flex flex-col justify-center text-center tracking-wider font-medium">
            <p>SHOP POLICY HERE</p>
            <p>SHOP POLICY HERE</p>
            <p>SHOP POLICY HERE</p>
            <p>SHOP POLICY HERE</p>
            <p>SHOP POLICY HERE</p>
            <p>SHOP POLICY HERE</p>
            <p>SHOP POLICY HERE</p>
          </div>

          <div className="flex-1 flex flex-col justify-center pl-2">
            <p className="text-muted-foreground font-medium text-sm mb-4">PAYMENT OPTIONS:</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => onPaymentSelect('GCash')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl py-4 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2"
              >
                <span className="bg-[#0052FE] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs italic font-black">
                  G
                </span> 
                GCash
              </button>
              
              <button 
                onClick={() => onPaymentSelect('Cash')}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xl py-4 rounded-lg shadow-sm transition-colors"
              >
                Cash
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;