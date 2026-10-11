import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const ProductList = ({ products, onRemove }) => {
    if (!products.length) return null;

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Added Products</h2>
            <div className="space-y-2">
                {products.map((product) => (
                    <div
                        key={product.productId}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                    >
                        <div>
                            <p className="font-medium text-foreground text-sm">{product.productName}</p>
                            <p className="text-xs text-muted-foreground">{product.productDisplayId}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-foreground">
                                {product.quantity} units
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onRemove(product.productId)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;