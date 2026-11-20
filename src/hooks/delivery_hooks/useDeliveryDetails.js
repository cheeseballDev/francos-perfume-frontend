import { supabase } from "@/lib/SupabaseClient";
import { getDeliveryDetails } from "@/services/DeliveryService";
import { useCallback, useEffect, useState } from "react";

export const useDeliveryDetails = (deliveryId) => {
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDetails = useCallback(async (isInitial = false) => {
        if (!deliveryId) return;
        if (isInitial) setIsLoading(true);
        setError(null);

        try {
            const data = await getDeliveryDetails(deliveryId);
            if (data) {
                setSelectedDelivery(data.data);
            }
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, [deliveryId]);

    useEffect(() => {
        loadDetails(true).catch(() => {});
    }, [loadDetails]);

    useEffect(() => {
        if (!deliveryId) return;

        const channel = supabase
            .channel(`delivery-details-${deliveryId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "delivery_items",
                    filter: `delivery_id=eq.${deliveryId}`,
                },() => {
                    loadDetails(false).catch(() => {});
                }
            ).on(
                "postgres_changes",
                { 
                    event: "*", 
                    schema: "public", 
                    table: "delivery",
                    filter: `delivery_id=eq.${deliveryId}`,
                }, 
                () => {
                    loadDetails(false).catch(() => {});
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [deliveryId, loadDetails]);

    return {
        selectedDelivery,
        setSelectedDelivery,
        isLoading,
        error,
        reload: () => loadDetails(false),
    };
};