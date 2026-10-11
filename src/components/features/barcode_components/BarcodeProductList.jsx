import { useBarcode } from "@/hooks/product_hooks/useBarcode";
import { SearchBar } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RefreshCw, Printer, Download, Loader2 } from 'lucide-react';

export default function BarcodeProductList() {
  const {
    allProducts,
    asyncState,
    selectProduct,
    setPrintQty,
    printQty,
    searchProducts,
    regenerateBarcode,
    handlePrint,
    handleSavePdf,
    selectedProduct,
    barcodeValue,
    lastGenerated,
  } = useBarcode();

  const handleSearchChange = (value) => {
    const query = value?.target ? value.target.value : value;
    searchProducts(query);
  };

  if (asyncState.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-bold text-lg text-foreground">Select Product</h2>
          <p className="text-sm text-muted-foreground">
            Search by name, display ID, or barcode
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              alert("Create product functionality will be implemented in a future update.");
            }}
            className="w-full sm:w-auto shrink-0 font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Product
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="shrink-0">
        <SearchBar
            value={asyncState.isLoading ? "" : (selectedProduct ? selectedProduct.product_name || "" : "")}
            onChange={handleSearchChange}
            placeholder="Search products..."
        />
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-0">
        {allProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No products found.</p>
        ) : (
          <>
            {allProducts.map((product) => {
              const isSelected = selectedProduct?.product_id === product.product_id;
              return (
                <div
                  key={product.product_id}
                  onClick={() => selectProduct(product)}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                      : "border-border bg-background hover:border-primary/50 hover:bg-accent/30"
                  }`}
                >
                  <div className="h-16 w-16 bg-card border border-border rounded flex items-center justify-center shrink-0 p-1">
                    <img
                      src={product.product_image_url || "/assets/FrancoPerfumeLogo.png"}
                      alt="Perfume"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{product.product_name}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{product.product_display_id}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Barcode: <span className="font-mono text-foreground">{product.product_barcode || "N/A"}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Date Created: {new Date(product.product_date_created).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground mb-1">Last Generated:</p>
                    <p className="text-[11px] text-foreground font-medium">
                      {lastGenerated || "Never"}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Selected Product Actions */}
      {selectedProduct && (
        <div className="pt-4 border-t border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-foreground">{selectedProduct.product_name}</h3>
              <p className="text-sm text-muted-foreground">{selectedProduct.product_display_id}</p>
            </div>
            <div className="text-right space-x-3">
              <Button
                variant="outline"
                onClick={regenerateBarcode}
                disabled={asyncState.isGenerating}
                className="w-24 h-9"
              >
                {asyncState.isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={asyncState.isPrinting}
                className="w-24 h-9"
              >
                {asyncState.isPrinting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Printer size={16} />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSavePdf}
                disabled={asyncState.isSaving}
                className="w-24 h-9"
              >
                {asyncState.isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Print Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              Print Quantity:
              <span className="text-xs text-muted-foreground">({printQty} label{printQty !== 1 ? "s" : ""})</span>
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPrintQty((prev) => Math.max(1, prev - 1))}
                disabled={printQty <= 1}
                className="w-8 h-8 p-0"
              >
                <Minus size={16} />
              </Button>
              <input
                type="number"
                value={printQty}
                onChange={(e) => setPrintQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-8 text-center border border-input bg-background text-foreground rounded outline-none focus:ring-2 focus:ring-primary font-bold"
                min="1"
              />
              <Button
                variant="outline"
                onClick={() => setPrintQty((prev) => prev + 1)}
                className="w-8 h-8 p-0"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}