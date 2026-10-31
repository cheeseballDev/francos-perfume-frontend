import { Button } from "@/components/ui/button";

const DashboardPanel = ({ title, actionText, onAction, children, className = "" }) => (
    <div className={`bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-foreground">{title}</h3>
            {actionText && (
                <button 
                    onClick={onAction}
                    className="text-sm font-bold text-primary hover:underline"
                >
                    {actionText}
                </button>
            )}
        </div>
        <div className="flex-1 flex flex-col gap-3">
            {children}
        </div>
        {actionText && (
            <Button 
                onClick={onAction}
                className="mt-6"
            >
                {actionText}
            </Button>
        )}
    </div>
);

export default DashboardPanel;