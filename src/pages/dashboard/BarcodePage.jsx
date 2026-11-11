import BarcodePreview from "@/components/features/barcode_components/BarcodePreview";
import BarcodeProductList from "@/components/features/barcode_components/BarcodeProductList";
import { useProduct } from "@/hooks/product_hooks/useProduct";
import { useState } from "react";

export default function BarcodePage() {
    const { 
        products, 
        asyncState,
        updateFilter, 
        fetchOneProductBarcode, 
        downloadOneProductBarcode, 
        downloadAllProductBarcodes,
        filter,
        pagination,
    } = useProduct();
    
    const [selectedProduct, setSelectedProduct] = useState(null);

    const isBusy = asyncState?.isLoading;

    return (
        <div className="bg-background font-montserrat flex flex-col relative animate-fade-in h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground leading-none mb-1">Barcode Management</h1>
                <p className="text-muted-foreground text-sm">Create, view, and manage product barcodes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ">
                <div className="mb-8 lg:col-span-7 flex flex-col bg-card rounded-lg border border-border shadow-sm p-4 overflow-hidden">
                    <BarcodeProductList 
                        setSelectedProduct={setSelectedProduct} 
                        selectedProduct={selectedProduct}
                        products={products}
                        isLoading={isBusy}
                        updateFilter={updateFilter}
                        fetchOneProductBarcode={fetchOneProductBarcode}
                        downloadAllProductBarcodes={downloadAllProductBarcodes}
                        downloadOneProductBarcode={downloadOneProductBarcode}
                        filter={filter}
                        pagination={pagination}
                    />
                </div>

                <div className="lg:col-span-5 h-fit sticky top-6">
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6 lg:p-8 flex flex-col">
                        <BarcodePreview
                            selectedProduct={selectedProduct}
                            downloadOneProductBarcode={downloadOneProductBarcode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}