import { renderBadgeForRequestTimeline, renderTimelineIcon, renderTimelineSubtitle } from "@/utils/timelineUtils";

const RequestTimeline = ({
    selectedRequest,
    }) => {

    const { approvals = [], items = [] } = selectedRequest;
    const totalProducts = items?.length || 0;
    const totalUnits = items?.reduce((sum, item) => sum + (item.requestedQty || 0), 0);

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Timeline</h2>

                <div className="relative pl-3">
                    {approvals.map((item, index) => {
                        const isLast = index === approvals.length - 1;
                        return (
                            <div
                                key={index}
                                className="relative flex gap-4 pb-8 last:pb-0 transition-opacity opacity-100"
                            >
                                {!isLast && (
                                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 border-l-2 border-dashed border-border" />
                                )}

                                <div className="relative flex items-center justify-center shrink-0">
                                    {renderTimelineIcon(item.status)}
                                </div>

                                <div className="grow flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight text-foreground">
                                            {item.stage}
                                        </h3>
                                        <div className="text-xs mt-1 flex items-center gap-1 font-medium text-muted-foreground">
                                            {renderTimelineSubtitle(item.stage, item.status, item.approverName, item.approverId, item.remarks)}
                                        </div>
                                    </div>
                                    <div>{renderBadgeForRequestTimeline(item.status)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <hr className="my-6 border-border" />

                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Summary</h2>
                    <div className="space-y-2 text-sm font-medium">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Products:</span>
                            <span className="font-bold text-foreground">{totalProducts}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Units:</span>
                            <span className="font-bold text-foreground">{totalUnits}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestTimeline;