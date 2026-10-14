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
            <button 
                onClick={onAction}
                className="w-full mt-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-md transition-colors"
            >
                {actionText}
            </button>
        )}
    </div>
);

export default DashboardPanel;