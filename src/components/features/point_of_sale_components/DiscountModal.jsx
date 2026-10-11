import React, { useState } from 'react';
import { X } from 'lucide-react';

const DiscountModal = ({ isOpen, onClose, onApply }) => {
  const [discountPrefix, setDiscountPrefix] = useState('PWD');
  const [recipients, setRecipients] = useState(1);

  if (!isOpen) return null;

  const handleApplyClick = () => {
    onApply(0.20); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all">
      <div className="bg-card text-card-foreground rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-border">
        
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className="text-2xl font-bold text-foreground">Add Discount</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={28} />
          </button>
        </div>
        
        <div className="p-6 pt-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <label className="text-[15px] text-muted-foreground font-medium">Enter discount prefix:</label>
            <select 
              value={discountPrefix} 
              onChange={(e) => setDiscountPrefix(e.target.value)}
              className="border border-input rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-ring bg-transparent cursor-pointer text-foreground"
            >
              <option value="PWD" className="bg-background text-foreground">PWD</option>
              <option value="SENIOR" className="bg-background text-foreground">SENIOR</option>
              <option value="PROMO" className="bg-background text-foreground">PROMO</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[15px] text-muted-foreground font-medium">Enter number of recipients:</label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setRecipients(Math.max(1, recipients - 1))}
                className="w-10 h-8 flex items-center justify-center bg-secondary text-secondary-foreground font-bold rounded hover:bg-secondary/80 transition-colors"
              >
                -
              </button>
              <div className="w-14 h-8 flex items-center justify-center border border-input rounded bg-transparent font-bold text-[15px] text-foreground" >
                {recipients}
              </div>
              <button 
                onClick={() => setRecipients(recipients + 1)}
                className="w-10 h-8 flex items-center justify-center bg-secondary text-secondary-foreground font-bold rounded hover:bg-secondary/80 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button 
            onClick={handleApplyClick}
            className="w-full bg-primary text-primary-foreground font-extrabold py-3.5 rounded mt-4 hover:bg-primary/90 transition-colors tracking-widest text-[15px]"
          >
            APPLY DISCOUNT
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;