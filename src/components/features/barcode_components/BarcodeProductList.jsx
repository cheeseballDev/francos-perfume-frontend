import { SearchBar } from "@/components/shared";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';
import { useState } from "react";
import { getBarcodeColumns } from "./BarcodeColumns";

const BarcodeProductList = ({ setSelectedProduct, selectedProduct, products, isLoading,  updateFilter, fetchOneProductBarcode, downloadAllProductBarcodes, downloadOneProductBarcode}) => {
    const [searchQuery, setSearchQuery] = useState("");

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
        //console.log(selectedTransaction);    
        const barcode = await fetchOneProductBarcode(row.productId);
        if (barcode) {
            setSelectedProduct(prev => prev ? { ...prev, ...barcode }: barcode);
        }
    }

    const barcodeColumns = getBarcodeColumns(downloadOneProductBarcode);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between gap-4">
                <SearchBar value={searchQuery} onChange={handleSearchChange} />
                <Button 
                    variant="outline" 
                    onClick={() => downloadAllProductBarcodes()}
                >
                    <Printer size={16} /> Download All
                </Button>
            </div>

            <DataTable
                columns={barcodeColumns}
                data={products}
                keyField="productId"
                asyncState={{ isLoading }}
                selectedItem={selectedProduct}
                onRowClick={handleRowClick}
                emptyMessage="No products with barcodes found."
            />
        </div>
    );
};

export default BarcodeProductList;