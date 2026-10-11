import { useAuth } from "@/auth/UseAuth";
import { checkout } from "@/services/pointOfSaleService";
// FIXED: Import the newly renamed function
import { formatCheckoutPayload, extractReceiptData } from "@/utils/pointOfSaleDTO";
import { useState } from "react";

export const useCheckout = (cart, grandTotal, appliedDiscountId) => {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFinalCheckout = async (paymentDetails, onSuccess) => {
        setIsProcessing(true);
        try {
            // FIXED: Use the new function name and perfectly mapped payload
            const posDto = formatCheckoutPayload(paymentDetails, grandTotal, appliedDiscountId, cart);
            const result = await checkout(posDto, user?.accessToken);
            
            const { receiptNumber, vat } = extractReceiptData(result);

            if (onSuccess) {
                onSuccess({ receiptNumber, vat });
            }
        } catch (error) {
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }

    return { handleFinalCheckout, isProcessing };
}