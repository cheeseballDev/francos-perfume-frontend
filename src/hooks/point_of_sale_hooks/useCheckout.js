import { useToast } from "@/components/ui/use-toast";
import { postCheckout } from "@/services/PointOfSaleService";
import { useState } from "react";

export const useCheckout = (cart, appliedDiscountId) => {
    const { toast } = useToast();

    const [isProcessing, setIsProcessing] = useState(false);

    const handleFinalCheckout = async (paymentDetails, onSuccess) => {
        setIsProcessing(true);
        try {
            const payload = {
                paymentMethod: paymentDetails.method,
                amountPaid: paymentDetails.amountPaid,
                discountId: appliedDiscountId || 0,
                referenceNumber: paymentDetails.referenceNumber || null,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.cartQty,
                }))
            };

            const result = await postCheckout(payload);
            
            onSuccess?.(result);

        } catch (error) {
            toast({
                title: "Checkout Failed!",
                description: `An error occurred during checkout. Please contact your administrators.\n${error.response?.data}`,
                variant: "destructive",
                duration: 5000
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return { handleFinalCheckout, isProcessing };
};