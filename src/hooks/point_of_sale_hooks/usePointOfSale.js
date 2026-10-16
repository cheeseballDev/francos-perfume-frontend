import { supabase } from "@/lib/SupabaseClient";
import { getAllProductsPOS } from "@/services/PointOfSaleService";
import { useCallback, useEffect, useState } from "react";

export const usePointOfSale = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState({
        search: '',
        product_type: '',
        product_gender: '',
    });

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAllProductsPOS(filter);
            setProducts(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300); 

        return () => clearTimeout(timer);
    }, [fetchProducts]);

    useEffect(() => {
        const channel = supabase
            .channel("public:pos-inventory-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inventory" }, 
                () => {
                    fetchProducts();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inventory_batch_items" }, 
                () => {
                    fetchProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProducts]);

    const updateFilter = (key, value) =>  {
        setFilter(prev => {
            if (key !== 'page') {
                return { ...prev, [key]: value, page: 1 };
            }
            return { ...prev, [key]: value };
        });
    };
        
    return { 
        products, 
        isLoading,
        error, 
        filter, 
        updateFilter, 
        fetchProducts 
    }; 
}