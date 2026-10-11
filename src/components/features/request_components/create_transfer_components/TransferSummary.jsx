import { useAuth } from '@/auth/UseAuth';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

const TransferSummary = ({ 
    fromBranch,
    toBranch,
    productCount,
    totalUnits,
    message,
    onMessageChange,
    onSubmit,
    isSubmitting,
    branchOptions = [],
}) => {
    const { user } = useAuth();

    const userBranchId = user.branchId;

    const fromBranchLabel = branchOptions.find(b => b.value === fromBranch)?.label;
    const toBranchLabel = branchOptions.find(b => b.value === toBranch)?.label;

    const isNotRelatedToBranchDirection = userBranchId
    ? String(fromBranch) !== String(userBranchId) && String(toBranch) !== String(userBranchId)
    : false;

    const direction = fromBranch === userBranchId ? 'OUTBOUND' : 'INBOUND';
    const hasProducts = productCount > 0;

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground">Transfer Request Summary</h2>

            {fromBranch && toBranch && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center text-sm text-primary">
                    {isNotRelatedToBranchDirection ? (
                        <span>
                            The request will be a transfer from{' '}
                            <span className="font-bold">{fromBranchLabel}</span> to{' '}
                            <span className="font-bold">{toBranchLabel}</span>
                        </span>
                    ) : (
                        <span>
                            The request will be an{' '}
                            <span className="font-bold">{direction}</span> request
                        </span>
                    )}
                </div>
            )}

            {hasProducts && (
                <div className="bg-muted rounded-lg p-3 text-center text-sm font-medium text-foreground">
                    {productCount} product(s) and {totalUnits} unit(s)
                </div>
            )}

            <div className="flex-1" />

            <div>
                <p className="text-sm font-semibold text-foreground mb-2">Request Message</p>
                <textarea
                    value={message || ''}
                    onChange={(e) => onMessageChange(e.target.value)}
                    placeholder="Add your comments or message for this request...."
                    className="w-full border border-input bg-transparent text-foreground rounded-lg p-3 text-sm resize-none h-24 outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
            </div>

            <Button
                variant="confirm"
                onClick={onSubmit}
                disabled={!hasProducts || !fromBranch || !toBranch || isSubmitting}
            >
                {isSubmitting ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                    <Send size={16} className="mr-2" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
        </div>
    );
};

export default TransferSummary;