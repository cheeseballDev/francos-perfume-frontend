import { renderBadgeForRequestTimeline, renderTimelineIcon, renderTimelineSubtitle } from "@/utils/timelineUtils";

const RequestTimeline = ({
    selectedRequest,
    }) => {

    const { approvals = [], items = [] } = selectedRequest;

    const totalProducts = items?.length || 0;
    const totalUnits = items?.reduce((sum, item) => sum + (item.receivedQty || 0), 0);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Timeline</h2>

                <div className="relative pl-3">
                    {approvals.map((item, index) => {
                        const isLast = index === approvals.length - 1;
                        return (
                            <div
                                key={index}
                                className="relative flex gap-4 pb-8 last:pb-0 transition-opacity opacity-100"
                            >
                                {!isLast && (
                                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 border-l-2 border-dashed border-gray-300" />
                                )}

                                <div className="relative z-10 shrink-0">
                                    {renderTimelineIcon(item.status)}
                                </div>

                                <div className="grow flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight text-gray-900">
                                            {item.stage}
                                        </h3>
                                        <div className="text-xs mt-1 flex items-center gap-1 font-medium text-gray-400">
                                            {renderTimelineSubtitle(item.stage, item.status, item.approver)}
                                        </div>
                                    </div>
                                    <div>{renderBadgeForRequestTimeline(item.status)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <hr className="my-6 border-gray-300" />

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
                    <div className="space-y-2 text-sm font-medium">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Products:</span>
                            <span className="font-bold text-gray-900">{totalProducts}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total Units:</span>
                            <span className="font-bold text-gray-900">{totalUnits}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestTimeline;