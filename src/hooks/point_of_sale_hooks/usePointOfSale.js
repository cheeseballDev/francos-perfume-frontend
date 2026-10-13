import { getAllProductsPOS } from "@/services/PointOfSaleService"; // FIXED: lowercase 'p' to match disk
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