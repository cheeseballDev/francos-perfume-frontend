import { getRequestDetails } from "@/services/RequestService";
import { useCallback, useEffect, useState } from "react";

export const useRequestDetails = (requestId) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [itemApprovals, setItemApprovals] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDetails = useCallback(async () => {
        if (!requestId) return;
        setIsLoading(true);
        try {
            const data = await getRequestDetails(requestId);
            if (data) {
                setSelectedRequest(data);
                const initialApprovals = {};
                (data.items || []).forEach((item) => {
                    initialApprovals[item.requestItemId] = {
                        isApproved: true,
                        approvedQty: item.requestedQty,
                    };
                });
                setItemApprovals(initialApprovals);
            }
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    return {
        selectedRequest,
        itemApprovals,
        setItemApprovals,
        isLoading,
        error,
        reload: loadDetails,
    };
};