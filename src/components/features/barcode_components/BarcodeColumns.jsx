import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const getBarcodeColumns = (onDownload) => [
    { accessorKey: "productDisplayId", header: "Product ID" },
    { accessorKey: "productName", header: "Product Name" },
    { accessorKey: "productBarcode", header: "Barcode" },
    {
        header: "Actions",
        render: (row) => (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload(row.productId);
                    }}
                >
                    <Download size={14} /> PDF
                </Button>
            </div>
        )
    }
];