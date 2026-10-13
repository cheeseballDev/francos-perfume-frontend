import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const getBarcodeColumns = (onDownload, downloadId) => [
    { accessorKey: "productDisplayId", header: "Product ID" },
    { accessorKey: "productName", header: "Product Name" },
    { accessorKey: "productBarcode", header: "Barcode" },
    {
        header: "Actions",
        render: (row) => {
            const isThisRowLoading = downloadId === row.productId;

            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isThisRowLoading}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload(row.productId);
                        }}
                    >
                        <Download size={14} />
                        PDF
                    </Button>
                </div>
            );
        }
    }
];