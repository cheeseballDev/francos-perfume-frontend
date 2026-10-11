export const formatCheckoutPayload = (paymentDetails, grandTotal, appliedDiscountId, cart) => {
    const received = String(paymentDetails.received ?? paymentDetails.amount ?? 0).replace(/,/g, '');
    const exactAmountPaid = paymentDetails.method === 'Cash'
    ? parseFloat(received) || 0
    : parseFloat(grandTotal.toFixed(2));

    return {
        // FIXED: Mapped to exactly match the C# POSDTO properties
        paymentMethod: paymentDetails.method.toUpperCase(),
        amountPaid: exactAmountPaid,
        discountId: appliedDiscountId || 0,
        items: cart.map(item => ({
            productId: item.product_id, 
            quantity: item.cartQty // FIXED: Your cart state uses cartQty, not quantity
        }))
    };
};

export const extractReceiptData = (result) => {
    const receiptData = result?.receipt || result?.Receipt || result?.data?.receipt;
    
    // Added camelCase fallbacks in case the backend response also changed
    const receiptNumber = receiptData?.receipt_number || receiptData?.receiptNumber || result?.sales_order_display_id || 'UNKNOWN';
    const vat = receiptData?.vatable_sales || receiptData?.vat || 0;
    
    return { receiptNumber, vat };
};