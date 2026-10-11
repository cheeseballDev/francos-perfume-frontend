import BarcodePreview from "@/components/features/barcode_components/BarcodePreview";
import BarcodeProductList from "@/components/features/barcode_components/BarcodeProductList";

export default function BarcodePage() {
    return (
        <div className="bg-background font-montserrat flex flex-col relative animate-fade-in h-full">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground leading-none mb-1">Barcode Management</h1>
                <p className="text-muted-foreground text-sm">Create, view, and manage product barcodes.</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">

                {/* LEFT COLUMN: Product Selection */}
                <div className="lg:col-span-7 flex flex-col bg-card rounded-lg border border-border shadow-sm p-4 overflow-hidden text-card-foreground">
                    <BarcodeProductList />
                </div>

                {/* RIGHT COLUMN: Barcode Preview */}
                <div className="lg:col-span-5 h-fit sticky top-6">
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6 lg:p-8 flex flex-col text-card-foreground">
                        <BarcodePreview />
                    </div>
                </div>

            </div>
        </div>
    );
}