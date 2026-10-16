import { useState } from "react";

export const useCart = () => {
    const [cart, setCart] = useState([]);
    const [appliedDiscountValue, setAppliedDiscountValue] = useState(0);
    const [appliedDiscountId, setAppliedDiscountId] = useState(0);
    const [appliedDiscountType, setAppliedDiscountType] = useState('PERCENTAGE');

    const handleAddToCart = (product, quantity) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.productId);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.productId
                        ? { ...item, cartQty: item.cartQty + quantity }
                        : item
                );
            }
            return [...prev, {
                productId: product.productId,
                name: product.productName,
                price: product.productPrice,
                cartQty: quantity,
            }];
        });
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const handleClearCart = () => {
        setCart([]);
        setAppliedDiscountValue(0);
        setAppliedDiscountId(0);
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);
    const discountAmount = appliedDiscountType === 'FIXED'
        ? Math.min(appliedDiscountValue, subtotal) 
        : subtotal * appliedDiscountValue;

    const grandTotal = Math.max(0, subtotal - discountAmount);

    return {
        cart,
        handleAddToCart,
        handleRemoveFromCart,
        handleClearCart,
        subtotal,
        discountAmount,
        grandTotal,
        appliedDiscountId,
        appliedDiscountValue,
        setAppliedDiscountId,
        setAppliedDiscountValue,
        appliedDiscountType,
        setAppliedDiscountType,
    };
};