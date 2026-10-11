import { MessageSquare } from "lucide-react";

export default function RequestInformation({ request }) {
    if (!request) return null;

    // Helper to format ISO date strings (e.g., "11/04/2026 6:70 AM")
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }) + " " + date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground">Request Information</h2>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span className="text-xs text-muted-foreground block font-medium">From Branch</span>
                    <span className="font-semibold text-foreground">
                        {request.requestedFrom || "N/A"}
                    </span>
                </div>
                <div>
                    <span className="text-xs text-muted-foreground block font-medium">To Branch</span>
                    <span className="font-semibold text-foreground">
                        {request.deliveredTo || "N/A"}
                    </span>
                </div>
                <div>
                    <span className="text-xs text-muted-foreground block font-medium">Created By</span>
                    <span className="font-semibold text-foreground">
                        {request.employeeDisplayId || "N/A"}
                    </span>
                </div>
                <div>
                    <span className="text-xs text-muted-foreground block font-medium">Date Created</span>
                    <span className="font-semibold text-foreground">
                        {formatDate(request.requestDateSubmitted)}
                    </span>
                </div>
            </div>

            {/* Request Message Box */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="font-bold text-primary text-sm">Request Message</h3>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">
                        {request.requestMessage && request.requestMessage !== "string"
                            ? request.requestMessage
                            : "No request message provided."}
                    </p>
                </div>
            </div>
        </div>
    );
}