import { useAuth } from "@/auth/UseAuth";
import { addNewProduct, getAllProductBarcodeDownload, getAllProducts, getOneProductBarcode, getOneProductBarcodeDownload, getProductDetails, getProductFilters, updateProductDetails } from "@/services/ProductService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useProduct = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const isFirstLoad = useRef(true);
    
    // can add the page and page size here
    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalEntries: 0,
    });

    const [filterOptions, setFilterOptions] = useState({
        productType: [],
        productGender: [],
    });

    const PRODUCT_FILTER_SCHEMA = [
        { key: "productType", label: "Filter: Type", allLabel: "All Types" },
        { key: "productGender", label: "Filter: Gender", allLabel: "All Gender" },
    ]

    const { filter, updateFilter, resetFilter } = useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        productType: '',
        productGender: '',
        pageCount: 1,
        pageSize: 10,
    });

    const fetchAllProducts = useCallback(() => {
      if (isFirstLoad.current) {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
      } else {
        setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
      }

      getAllProducts(filter)
        .then(data => {
            isFirstLoad.current = false;
            
            setProducts(data.data);
            setPagination({
                totalPages: data.totalProductsPages || 0,
                totalEntries: data.totalProducts || 0,
            });
        })
        .catch((err) => {
            setAsyncState((prev) => ({ ...prev, error: err }));
        })
        .finally(() => {
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false}));
        });

    }, [filter]);

    useEffect(() => {
    const timer = setTimeout(() => {
        fetchAllProducts();
    }, 0);
    return () => clearTimeout(timer);
    }, [fetchAllProducts]);

    const getProduct = async (id) => {
        try {
            const data = getProductDetails(id);
            return data;
        } catch (err) {
            setAsyncState({ error: err })
        }
    }

    const updateProduct = async (id, dto) => {
        try {
            const data = updateProductDetails(id, dto);
            fetchAllProducts();
            return data;
        } catch (err) {
            setAsyncState({ error: err })
        }
    }

    const createProduct = async (dto) => {
        try {
            const data = await addNewProduct(dto);
            await fetchAllProducts();
            return data;
        } catch (err) {
            setAsyncState({ error: err })
        }
    }

    const fetchProductFilters = useCallback(async () => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await getProductFilters();
            setFilterOptions(buildFilterOptions(data, PRODUCT_FILTER_SCHEMA));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchProductFilters();
    }, [fetchProductFilters]);

    const fetchOneProductBarcode = useCallback(async (productId) => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await getOneProductBarcode(productId);
            return data;
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [])

    const downloadOneProductBarcode = async (productId) => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const blob = await getOneProductBarcodeDownload(productId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `barcode-${productId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const downloadAllProductBarcodes = async () => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const blob = await getAllProductBarcodeDownload();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `barcode-list.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    };
    return { 
      products, 
      asyncState,
      pagination,
      filter,
      updateFilter,
      filterOptions,
      getProduct,
      updateProduct,
      createProduct,
      fetchOneProductBarcode,
      downloadOneProductBarcode,
      downloadAllProductBarcodes
    };
}