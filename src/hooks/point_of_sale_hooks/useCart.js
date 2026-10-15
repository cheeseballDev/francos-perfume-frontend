import { useState } from "react";

export const useCart = () => {
    const [cart, setCart] = useState([]);
    const [appliedDiscountRate, setAppliedDiscountRate] = useState(0);
    const [appliedDiscountId, setAppliedDiscountId] = useState(0);

    const handleAddToCart = (product, quantity) => {
        setCart(prevCart => {
            const targetId = product.productId;
            
            const existing = prevCart.find(item => 
                (item.productId) === targetId
            );
            
            if (existing) {
                return prevCart.map(item => 
                    (item.product_id || item.productId || item.id) === targetId 
                        ? { ...item, cartQty: item.cartQty + quantity } 
                        : item
                );
            }
            
            return [...prevCart, { 
                ...product, 
                productId: targetId,
                name: product.productName, 
                price: product.productPrice, 
                cartQty: quantity 
            }];
        });
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => 
            (item.productId) !== productId
        ));
    };

    const handleClearCart = () => {
        setCart([]);
        setAppliedDiscountRate(0);
        setAppliedDiscountId(0);
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);
    const discountAmount = subtotal * appliedDiscountRate;
    const grandTotal = subtotal - discountAmount;

    return { 
        cart, 
        handleAddToCart, 
        handleRemoveFromCart, 
        handleClearCart, 
        subtotal, 
        discountAmount, 
        grandTotal, 
        appliedDiscountId, 
        appliedDiscountRate, 
        setAppliedDiscountId, 
        setAppliedDiscountRate 
    }
}