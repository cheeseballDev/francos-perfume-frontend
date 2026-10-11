import { getAllProductsPOS } from "@/services/pointOfSaleService"; // FIXED: lowercase 'p' to match disk
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/UseAuth";

export const usePointOfSale = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState({
        search: '',
        product_type: '',
        product_gender: '',
    });

    // FIXED: Extracted to a callable function that returns a Promise
    const fetchProducts = useCallback(async () => {
        if (!user?.accessToken) return;
        setIsLoading(true);
        try {
            const response = await getAllProductsPOS(filter, user.accessToken);
            setProducts(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [filter, user?.accessToken]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilter = (key, value) =>  {
        setFilter(prev => {
            if (key !== 'page') {
                return { ...prev, [key]: value, page: 1 };
            }
            return { ...prev, [key]: value };
        });
    };
        
    // FIXED: Exporting fetchProducts so the main page can call it
    return { products, isLoading, error, filter, updateFilter, fetchProducts }; 
}