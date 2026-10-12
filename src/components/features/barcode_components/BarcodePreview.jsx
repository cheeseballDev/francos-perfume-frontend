import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Barcode from 'react-barcode';

const BarcodePreview = ({ selectedProduct, downloadOneProductBarcode }) => {
    if (!selectedProduct) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p className="text-sm">Select a product to preview its barcode</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-lg font-bold">{selectedProduct.productName}</h2>
                <p className="text-sm text-muted-foreground">{selectedProduct.productBarcode}</p>
            </div>

            <div className="flex justify-center p-4 bg-white border border-border rounded-lg">
                <Barcode
                    value={selectedProduct.productBarcode}
                    format="CODE128"
                    width={2}
                    height={80}
                    displayValue={true}
                />
            </div>

            <Button className="w-full" onClick={() => downloadOneProductBarcode(selectedProduct.productId)}>
                <Download size={16} /> Download PDF
            </Button>
        </div>
    );
};

export default BarcodePreview;