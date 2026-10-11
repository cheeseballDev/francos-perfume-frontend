import { CancelConfirmModal, CashPaymentModal, CheckoutModal, DiscountModal, GCashPaymentModal, PointOfSaleFilterBar, ProductCard, ProductModal } from '@/components/features/point_of_sale_components';
import { ProfileDropdown } from '@/components/shared';
import ConfirmDialog from "@/components/shared/ConfirmDialog"; 
import { Button } from '@/components/ui/button';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useCart } from '@/hooks/point_of_sale_hooks/useCart';
import { useCheckout } from '@/hooks/point_of_sale_hooks/useCheckout';
import { usePointOfSale } from '@/hooks/point_of_sale_hooks/usePointOfSale';
import { useClock } from '@/hooks/useClock';

const PointOfSalePage = () => {
  // FIXED: Destructure fetchProducts from the hook
  const { products, isLoading, filter, updateFilter, fetchProducts } = usePointOfSale();

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [config, setConfig] = useState(null); 

  const currentDateTime = useClock();
  const { cart, handleAddToCart, handleRemoveFromCart, handleClearCart, subtotal, discountAmount, grandTotal, appliedDiscountId, appliedDiscountRate, setAppliedDiscountId, setAppliedDiscountRate } = useCart();

  const { handleFinalCheckout, isProcessing } = useCheckout(cart, grandTotal, appliedDiscountId);    

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handlePaymentSelect = (method) => {
    setShowCheckoutModal(false);
    if (method === 'Cash') setShowCashModal(true);
    if (method === 'GCash') setShowGCashModal(true);
  };

  const onConfirmPayment = async (paymentDetails) => {
    try {
      await handleFinalCheckout(paymentDetails, async (receiptData) => {
        handleClearCart();
        setAppliedDiscountRate(0);
        setAppliedDiscountId(0);
        setShowCashModal(false);
        setShowGCashModal(false);
        setShowCheckoutModal(false);
        
        // FIXED: Force a network request to pull the newly deducted stock levels
        if (typeof fetchProducts === 'function') {
            await fetchProducts();
        }
        
        setConfig({
          isAlert: true,
          title: "Transaction Successful!",
          description: `Receipt Number: ${receiptData?.receiptNumber || 'N/A'} \n VAT: ₱${receiptData?.vat || 0}`,
          confirmVariant: "default",
          confirmText: "New Order",
          onConfirm: () => setConfig(null)
        });
      });
    } catch (error) {
      setShowCashModal(false);
      setShowGCashModal(false);
      setShowCheckoutModal(false);
      
      setConfig({
        isAlert: true,
        title: "Checkout Failed",
        description: error.message || "An error occurred during checkout. Please verify inventory levels.",
        confirmVariant: "destructive",
        confirmText: "Acknowledge",
        onConfirm: () => setConfig(null)
      });
    }
  };

  return (
    <div className="flex h-screen bg-background font-montserrat overflow-hidden relative text-foreground">
      <div className="flex-1 flex flex-col h-full pl-6 py-6 pr-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
            <p className="text-muted-foreground text-sm">{currentDateTime}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-transparent"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <ProfileDropdown />
          </div>
        </div>

        <PointOfSaleFilterBar filter={filter} updateFilter={updateFilter} />
        
        <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col gap-4 h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard 
                  key={product.productId || product.product_id}
                  name={product.productName || product.product_name || product.name}
                  type={product.productType || product.product_type || product.type}
                  gender={product.productGender || product.product_gender || product.gender}
                  imageUrl={product.productImageUrl || product.product_image_url || product.imageUrl}
                  price={product.productPrice || product.product_price || product.price}
                  
                  onAddToCart={() => setSelectedProduct({
                      ...product, 
                      name: product.productName || product.product_name || product.name,
                      price: product.productPrice || product.product_price || product.price,
                      product_id: product.productId || product.product_id || product.id
                  })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="w-[400px] bg-card border-l border-border shadow-2xl flex flex-col h-full z-10">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Current Order</h2>
          <p className="text-sm text-muted-foreground">{cart.length} Items</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <span className="text-6xl mb-4">🛒</span>
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">₱{item.price} x {item.cartQty}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-emerald-500">₱{(item.price * item.cartQty).toLocaleString()}</p>
                  <button 
                    onClick={() => {
                      setConfig({
                        isAlert: false,
                        title: "Remove Item",
                        description: `Are you sure you want to remove ${item.name} from the cart?`,
                        confirmVariant: "destructive",
                        confirmText: "Remove",
                        onConfirm: () => {
                          handleRemoveFromCart(item.product_id);
                          setConfig(null);
                        }
                      });
                    }} 
                    className="text-destructive hover:text-destructive/80 font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-background border-t border-border">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-emerald-500 font-medium">
              <span>Discount {appliedDiscountRate > 0 && `(${(appliedDiscountRate * 100)}%)`}</span>
              <span>- ₱{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span>₱{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button variant="outline" className="py-6 text-destructive border-destructive/50 hover:bg-destructive/10" disabled={cart.length === 0} onClick={() => setShowCancelConfirm(true)}>Cancel</Button>
            <Button variant="outline" className="py-6 bg-muted border-border text-foreground hover:bg-muted/80" disabled={cart.length === 0} onClick={() => setShowDiscountModal(true)}>Discount</Button>
          </div>
          <Button className="w-full py-8 text-xl font-bold tracking-widest shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white border-none" disabled={cart.length === 0 || isProcessing} onClick={() => setShowCheckoutModal(true)}>
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                PROCESSING...
              </span>
            ) : "PAYMENT"}
          </Button>
        </div>
      </div>

      <ProductModal isOpen={!!selectedProduct} product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={handleAddToCart} />
      <DiscountModal isOpen={showDiscountModal} onClose={() => setShowDiscountModal(false)} onApply={(rate, id) => { setAppliedDiscountRate(rate); setAppliedDiscountId(id); setShowDiscountModal(false); }} />
      <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} grandTotal={grandTotal} onPaymentSelect={handlePaymentSelect} />
      <CashPaymentModal isOpen={showCashModal} onClose={() => setShowCashModal(false)} grandTotal={grandTotal} onConfirmPayment={onConfirmPayment} />
      <GCashPaymentModal isOpen={showGCashModal} onClose={() => setShowGCashModal(false)} onConfirmPayment={onConfirmPayment} />

      <CancelConfirmModal isOpen={showCancelConfirm} 
        onConfirm={() => {
          handleClearCart();
          setAppliedDiscountRate(0);
          setAppliedDiscountId(0);
          setShowCancelConfirm(false);
        }}
        onClose={()=> setShowCancelConfirm(false) } />

      <ConfirmDialog
        isOpen={!!config}
        onClose={() => setConfig(null)}
        config={config}
      />
    </div>
  );
};

export default PointOfSalePage;