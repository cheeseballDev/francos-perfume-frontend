import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from '@/components/ui/button';
import { useRequest } from '@/hooks/request_hooks/useRequest';
import { createRequest } from '@/services/RequestService';
import { isValid, validateForm } from '@/utils/validationUtils';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from './create_transfer_components/BranchSelector';
import ProductList from './create_transfer_components/ProductList';
import ProductSelector from './create_transfer_components/ProductSelector';
import TransferSummary from './create_transfer_components/TransferSummary';

const INITIAL_DATA_STATE = {
    fromBranch: null,
    toBranch: null,
    requestMessage: "", 
    items: []
}

const requestValidationSchema = {
    requestMessage: [isValid.maxLength(255)],
    items: [
        (value) => (value.length === 0 ? "Please add at least one product" : null)
    ]
}

const CreateTransferRequestPage = () => {
    const navigate = useNavigate();

    const { fetchRequestFilters } = useRequest();
    
    const [data, setData] = useState(INITIAL_DATA_STATE);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [config, setConfig] = useState(null);

    const totalUnits = (data.items || []).reduce((sum, item) => sum + item.quantity, 0);
    
    const [branchOptions, setBranchOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    useEffect(() => {
        fetchRequestFilters().then(data => {
            if (!data) return;
            setBranchOptions((data.branches).map(branch => ({
                value: branch.branchId,
                label: branch.branchLocation,
            })));
            setProductOptions((data.products).map(product => ({
                value: product.productId,
                label: product.productName,
                availableQty: product.productQty || 0,
            })));
        });
    }, [fetchRequestFilters]);

    useEffect(() => {
        if (!data.fromBranch) {
            setProductOptions([]);
            return;
        }

        fetchRequestFilters().then(raw => {
            if (!raw) return;
            setProductOptions((raw.products || []).map(p => ({
                value: p.productId,
                label: p.productName,
                availableQty: p.productQty || 0,
            })));
        });
    }, [data.fromBranch]);

    const handleAddProduct = () => {
    if (!selectedProduct) return;

    const productOption = productOptions.find(p => p.value === selectedProduct);
    if (!productOption) return;

    const fromBranchName = branchOptions.find(
        b => b.value === data.fromBranch
    )?.label?.toUpperCase();
    
    const isWarehouse = fromBranchName === 'WAREHOUSE';

    const existingItem = data.items?.find(p => p.productId === productOption.value);
    const alreadyAddedQty = existingItem ? existingItem.quantity : 0;

    const maxAvailable = productOption.availableQty ?? 0;
    const remainingAllowed = isWarehouse ? Infinity : (maxAvailable - alreadyAddedQty);

    if (!isWarehouse && quantity > remainingAllowed) {
        setConfig({
            isAlert: true,
            title: "Exceeds Available Stock",
            description: `You can only add up to ${remainingAllowed} more unit(s) of this product.`,
            confirmVariant: "destructive",
            confirmText: "Acknowledge",
            onConfirm: () => setConfig(null)
        });
        return;
    }

        setData(prev => {
            const existingIndex = prev.items.findIndex(p => p.productId === productOption.value);
            
            let updatedItems = [...prev.items];

            if (existingIndex !== -1) {
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity: updatedItems[existingIndex].quantity + quantity
                } 
            } else {
                updatedItems.push({
                    productId: productOption.value,
                    productName: productOption.label,
                    quantity: quantity
                })
            }

            return { ...prev, items: updatedItems };
        });
        
        setSelectedProduct('');
        setQuantity(1);
    };
    
    const handleRemoveProduct = (productId) => {
        setData(prev => ({
            ...prev,
            items: prev.items.filter(p => p.productId !== productId)
        }));
    };

    const executeSubmission = async () => {
        setIsSubmitting(true);
        try {
            const fromBranchStr = branchOptions.find(b => b.value === data.fromBranch)?.label;
            const toBranchStr = branchOptions.find(b => b.value === data.toBranch)?.label;

            const payload = {
                fromBranch: fromBranchStr,
                toBranch: toBranchStr,
                requestMessage: data.requestMessage || null,
                items: data.items.map(item => ({
                    productId: item.productId,
                    requestedQty: item.quantity,
                }))
            };

            await createRequest(payload);
            setConfig(null);
            navigate('/home/requests');
        } catch (error) {
            console.error("Submission failed:", error);
            setConfig({
                isAlert: true,
                title: "Submission Failed",
                description: error.message || "Failed to create transfer request.",
                confirmVariant: "destructive",
                confirmText: "Acknowledge",
                onConfirm: () => setConfig(null)
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitClick = () => {
        if (!data.fromBranch || !data.toBranch) {
            setConfig({
                isAlert: true,
                title: "Missing Branches",
                description: "You must select both a Source Branch and a Destination Branch.",
                confirmVariant: "default",
                confirmText: "Okay",
                onConfirm: () => setConfig(null)
            });
            return;
        }

        const validationError = validateForm(data, requestValidationSchema);
        if (Object.keys(validationError).length > 0) {
            setConfig({
                isAlert: true,
                title: "Validation Error",
                description: Object.values(validationError)[0], 
                confirmVariant: "destructive",
                confirmText: "Fix Errors",
                onConfirm: () => setConfig(null)
            });
            return;
        }

        setConfig({
            isAlert: false,
            title: "Submit Transfer Request?",
            description: `You are requesting ${totalUnits} units of ${data.items.length} products. This action will place the request in a pending state for approval.`,
            confirmVariant: "success",
            confirmText: "Submit Request",
            onConfirm: executeSubmission
        });
    };

    return (
        <div className="flex flex-col h-full font-montserrat animate-fade-in relative">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Create Transfer Request</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <BranchSelector
                        fromBranch={data.fromBranch}
                        toBranch={data.toBranch}
                        setFromBranch={(value) => setData(prev => ({ ...prev, fromBranch: value }))}
                        setToBranch={(value) => setData(prev => ({ ...prev, toBranch: value }))}
                        onClear={() => setData(prev => ({ ...prev, fromBranch: null, toBranch: null }))}
                        branchOptions={branchOptions}
                    />
                    <ProductSelector
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
                        quantity={quantity}
                        setQuantity={setQuantity}
                        productOptions={productOptions}
                        handleAddProduct={handleAddProduct}
                        fromBranch={data.fromBranch}
                        branchOptions={branchOptions}
                    />
                    <ProductList
                        products={data.items}
                        onRemove={handleRemoveProduct}
                    />
                </div>

                <TransferSummary
                    fromBranch={data.fromBranch}
                    toBranch={data.toBranch}
                    productCount={data.items.length}
                    totalUnits={totalUnits}
                    message={data.requestMessage}
                    onMessageChange={(value) => setData(prev => ({ ...prev, requestMessage: value }))}
                    onSubmit={handleSubmitClick} 
                    isSubmitting={isSubmitting}
                    branchOptions={branchOptions}
                />
            </div>

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                config={config}
            />
        </div>
    );
};

export default CreateTransferRequestPage;