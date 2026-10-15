
import { postCheckout } from "@/services/PointOfSaleService";
import { extractReceiptData, formatCheckoutPayload } from "@/utils/pointOfSaleDTO";
import { useState } from "react";

export const useCheckout = (cart, grandTotal, appliedDiscountId) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFinalCheckout = async (paymentDetails, onSuccess) => {
        setIsProcessing(true);
        try {
            
            const posDto = formatCheckoutPayload(paymentDetails, grandTotal, appliedDiscountId, cart);
            const result = await postCheckout(posDto);
            
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