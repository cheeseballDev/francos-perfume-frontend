import { useRef, useState } from "react";

export const useCart = () => {
    const [cart, setCart] = useState([]);
    const [appliedDiscountValue, setAppliedDiscountValue] = useState(0);
    const [appliedDiscountId, setAppliedDiscountId] = useState(0);
    const [appliedDiscountType, setAppliedDiscountType] = useState('PERCENTAGE');

    const cartRef = useRef(cart);

    const updateCart = (next) => {
        cartRef.current = next;
        setCart(next);
    };

    const getCartQty = (productId) =>
        cartRef.current.find(item => item.productId === productId)?.cartQty ?? 0;

    const handleAddToCart = (product, quantity, availableStock) => {
        const stock = Number(availableStock ?? product.productQty);
        const inCart = getCartQty(product.productId);

        if (Number.isFinite(stock)) {
            if (stock <= 0) {
                return `${product.productName} is out of stock.`;
            }
            if (inCart + quantity > stock) {
                return `Only ${stock} ${product.productName} in stock and ${inCart} already in the order.`;
            }
        }

        const current = cartRef.current;
        const existing = current.find(item => item.productId === product.productId);
        updateCart(existing
            ? current.map(item =>
                item.productId === product.productId
                    ? { ...item, cartQty: item.cartQty + quantity }
                    : item
            )
            : [...current, {
                productId: product.productId,
                name: product.productName,
                price: product.productPrice,
                cartQty: quantity,
            }]);
        return null;
    };

    const handleRemoveFromCart = (productId) => {
        updateCart(cartRef.current.filter(item => item.productId !== productId));
    };

    const handleClearCart = () => {
        updateCart([]);
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
        getCartQty,
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