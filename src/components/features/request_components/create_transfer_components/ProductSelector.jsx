import SearchableProductSelect from '@/components/shared/SearchableProductSelect';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useEffect } from 'react';

const ProductSelector = ({ 
    selectedProduct, 
    setSelectedProduct,
    quantity, 
    setQuantity,
    productOptions,
    handleAddProduct,
    fromBranch,
    branchOptions,
}) => {
    const selectedProductOption = productOptions.find(p => p.value === selectedProduct);
    const availableQty = selectedProductOption?.availableQty ?? null;

    const fromBranchName = branchOptions?.find(
        b => b.value === fromBranch
    )?.label?.toUpperCase();
    const isWarehouse = fromBranchName === 'WAREHOUSE';

    const maxQty = isWarehouse ? 99 : (availableQty);
    const displayQty = isWarehouse ? '99' : (availableQty !== 0 ? availableQty : '--');

    const hasNoStock = !isWarehouse && availableQty === 0;

    useEffect(() => {
        if (!selectedProduct) return;
        setQuantity(hasNoStock ? 0 : 1);
    }, [selectedProduct, hasNoStock, setQuantity]);

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Select Products to Request</h2>
            
            <div className="flex items-end gap-4 mb-4">
                <div className="flex-1">
                    <SearchableProductSelect
                        productOptions={productOptions}
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
                        placeholder="Select product..."
                    />
                </div>

                <div className="text-center min-w-20">
                    <p className="text-xs text-muted-foreground mb-1 leading-tight">
                        Available Qty in<br/>Source Branch
                    </p>
                    <p className="font-bold text-foreground">
                        {selectedProduct ? displayQty : '--'}
                    </p>
                </div>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Qty to Request</p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Minus size={14} />
                        </Button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setQuantity(isWarehouse ? Math.max(1, val) : Math.min(maxQty, Math.max(1, val)));
                            }}
                            className="w-14 text-center border border-input bg-transparent text-foreground rounded-md p-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                            min={1}
                            max={isWarehouse ? undefined : availableQty}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setQuantity(prev => 
                                isWarehouse ? prev + 1 : Math.min(maxQty, prev + 1)
                            )}
                        >
                            <Plus size={14} />
                        </Button>
                    </div>
                </div>  
            </div>

            <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAddProduct}
                disabled={!selectedProduct || availableQty === 0 || quantity === 0}
            >
                Add Product
            </Button>
        </div>
    );
};

export default ProductSelector;