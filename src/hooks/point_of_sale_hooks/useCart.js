import { useState } from "react";

export const useCart = () => {
    const [cart, setCart] = useState([]);
    const [appliedDiscountRate, setAppliedDiscountRate] = useState(0);
    const [appliedDiscountId, setAppliedDiscountId] = useState(0);

    const handleAddToCart = (product, quantity) => {
        setCart(prevCart => {
            // Standardize the ID check so it never misses a duplicate
            const targetId = product.product_id || product.productId || product.id;
            
            const existing = prevCart.find(item => 
                (item.product_id || item.productId || item.id) === targetId
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
                // Force standardize the properties for the cart
                product_id: targetId,
                name: product.name || product.productName || product.product_name || 'Unknown Item', 
                price: product.price || product.productPrice || product.product_price || 0, 
                cartQty: quantity 
            }];
        });
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => 
            (item.product_id || item.productId || item.id) !== productId
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

  return { cart, handleAddToCart, handleRemoveFromCart, handleClearCart, subtotal, discountAmount, grandTotal, appliedDiscountId, appliedDiscountRate, setAppliedDiscountId, setAppliedDiscountRate }
}