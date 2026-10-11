import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Minus, Plus, X } from "lucide-react";
import { useState } from "react";

const EditBatchModal = ({ isOpen, onClose, batch, onSave }) => {
  
  const [batchId, setBatchId] = useState(batch?.batchId || 0);
  const [batchDisplayId, setBatchDisplayId] = useState(batch?.batchDisplayId || "");
  const [productName, setProductName] = useState(batch?.productName || "")
  const [quantity, setQuantity] = useState(batch?.quantity || 0);
  const [targetDate, setTargetDate] = useState(batch?.targetDate || "");
  const [reason, setReason] = useState("Restock");

  const handleSave = () => {
    onSave({
      batchId,  
      batchDisplayId,
      productName,
      quantity,
      targetDate,
      reason,
    });
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md font-montserrat p-8" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Edit Batch: {batchDisplayId}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <span className="w-1/3 text-sm text-muted-foreground font-medium">Selected Perfume:</span>
            <span className="w-2/3 font-bold text-foreground text-base">{productName}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="w-1/3 text-sm text-muted-foreground font-medium">Target Date:</span>
            <div className="w-2/3">
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-foreground bg-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="w-1/3 text-sm text-muted-foreground font-medium">Stock Adjustment:</span>
            <div className="w-2/3 flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="icon-sm" 
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus size={16} />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24 text-center font-bold text-lg focus:ring-ring"
              />
              <Button 
                variant="secondary" 
                size="icon-sm" 
                onClick={() => setQuantity(q => Math.max(0, q - 1))}
              >
                <Minus size={16} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="w-1/3 text-sm text-muted-foreground font-medium">Reason for edit:</span>
            <div className="w-2/3">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="w-full bg-transparent">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Restock">Restock</SelectItem>
                  <SelectItem value="Correction">Correction</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex w-full justify-between sm:justify-between pt-2">
          <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-muted/50" onClick={onClose}>
            <X size={16} /> Cancel
          </Button>
          <Button className="gap-2 px-8 shadow-sm" onClick={handleSave}>
            <Check size={16} /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBatchModal;