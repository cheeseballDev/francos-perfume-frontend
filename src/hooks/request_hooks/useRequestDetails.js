import { supabase } from "@/lib/SupabaseClient";
import { getRequestDetails } from "@/services/RequestService";
import { useCallback, useEffect, useState } from "react";

export const useRequestDetails = (requestId) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [itemApprovals, setItemApprovals] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDetails = useCallback(async (isInitial = false) => {
        if (!requestId) return;
        if (isInitial) setIsLoading(true);
        
        try {
            const data = await getRequestDetails(requestId);
            if (data) {
                setSelectedRequest(data);
                
                if (isInitial) {
                    const initialApprovals = {};
                    (data.items || []).forEach((item) => {
                        initialApprovals[item.requestItemId] = {
                            isApproved: true,
                            approvedQty: item.requestedQty,
                        };
                    });
                    setItemApprovals(initialApprovals);
                }
            }
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        loadDetails(true);
    }, [loadDetails]);

    useEffect(() => {
        if (!requestId) return;

        const channel = supabase
            .channel(`request-details-${requestId}`)
            .on(
                "postgres_changes",
                { 
                    event: "*", schema: "public", table: "request_approval", filter: `request_id=eq.${requestId}`
                } , 
                () => {
                    loadDetails(false);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestId, loadDetails]);

    return {
        selectedRequest,
        itemApprovals,
        setItemApprovals,
        isLoading,
        error,
        reload: () => loadDetails(true),
    };
};