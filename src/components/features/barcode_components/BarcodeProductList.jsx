import { SearchFilterBar } from "@/components/shared";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from 'lucide-react';
import { useState } from "react";
import { getBarcodeColumns } from "./BarcodeColumns";

const BarcodeProductList = ({ 
    setSelectedProduct, 
    selectedProduct, 
    products, 
    isLoading,  
    updateFilter, 
    fetchOneProductBarcode, 
    downloadAllProductBarcodes, 
    downloadOneProductBarcode
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadId, setDownloadId] = useState(null);

    const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchQuery(query);
        updateFilter('search', query);
    };

    const handleRowClick = async (row) => {
        if (selectedProduct?.productId === row.productId) {
            setSelectedProduct(null);
            return;
        }
        setSelectedProduct(row);
        const barcode = await fetchOneProductBarcode(row.productId);
        if (barcode) {
            setSelectedProduct(prev => prev ? { ...prev, ...barcode }: barcode);
        }
    }

    const handleDownloadAll = async () => {
        try {
            setIsDownloading(true);
            await downloadAllProductBarcodes();
        } finally {
            setIsDownloading(false);
        }
    } 

    const handleSingleDownload = async (productId) => {
        try {
            setDownloadId(productId);
            await downloadOneProductBarcode(productId);
        } finally {
            setDownloadId(null); 
        }
    };

    const barcodeColumns = getBarcodeColumns(handleSingleDownload, downloadId);

    return (
        <div className="flex flex-col h-full gap-4">
            <SearchFilterBar
                searchValue={searchQuery}
                onSearchChange={handleSearchChange}
                className=""
                actions={
                    <Button
                        variant="outline"
                        onClick={handleDownloadAll}
                        disabled={isDownloading}
                        className="shrink-0"
                    >
                        {isDownloading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Printer size={16} className="mr-2" />}
                        {isDownloading ? "Downloading..." : "Download All"}
                    </Button>
                }
            />

            <DataTable
                columns={barcodeColumns}
                data={products}
                keyField="productId"
                // FIXED: Explicitly mapping the boolean into the asyncState object DataTable expects
                asyncState={{ isLoading: isLoading, isFetching: false }} 
                selectedItem={selectedProduct}
                onRowClick={handleRowClick}
                emptyMessage="No products found."
            />
        </div>
    );
};

export default BarcodeProductList;