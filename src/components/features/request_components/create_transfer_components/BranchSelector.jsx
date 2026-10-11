import FormSelect from '@/components/shared/FormSelect';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const BranchSelector = ({ fromBranch, toBranch, setFromBranch, setToBranch, onClear, branchOptions }) => {
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Branch Information</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <FormSelect
                    label="Source Branch (From)"
                    value={fromBranch}
                    onChange={(value) => setFromBranch(value)}
                    options={branchOptions}
                    placeholder="Select source branch..."
                />
                <FormSelect
                    label="Destination Branch (To)"
                    value={toBranch}
                    onChange={(value) => setToBranch(value)}
                    options={branchOptions.filter(b => 
                        b.value !== fromBranch && !b.label.includes('WAREHOUSE')
                    )}
                    placeholder="Select destination branch..."
                />
            </div>

            <Button
                variant="outline"
                className="w-full border-dashed border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onClear}
                disabled={!fromBranch && !toBranch}
            >
                <X size={14} className="mr-2" /> Clear selected branches
            </Button>
        </div>
    );
};

export default BranchSelector;