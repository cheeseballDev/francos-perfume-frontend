import logo from '../../../assets/FrancoPerfumeLogo.png';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProductModal = ({ product, isOpen, onClose, onAdd }) => {
    const [quantity, setQuantity] = useState(1);

    const availableStock = product?.productQty ?? 0;

    useEffect(() => {
        if (isOpen) setQuantity(1);
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const handleAddClick = () => {
        const finalQuantity = quantity === '' || quantity < 1 ? 1 : quantity;
        onAdd(product, finalQuantity);
        onClose();
    };

    const handleIncrement = () => {
        if (quantity < availableStock) {
        setQuantity((prev) => (prev === '' ? 1 : prev + 1));
        }
    };

    const handleDecrement = () => {
        setQuantity((prev) => {
        if (prev === '' || prev <= 1) return 1;
            return prev - 1;
        });
    };

    const handleQuantityChange = (e) => {
        const val = e.target.value;
        
        if (val === '') {
            setQuantity('');
            return;
        }

        const numVal = parseInt(val, 10);

        if (isNaN(numVal) || numVal < 1) {
            setQuantity(1);
            return;
        }

        if (numVal > availableStock) {
            setQuantity(availableStock);
            } else {
            setQuantity(numVal);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all p-4">
        <div className="bg-card text-card-foreground rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-border relative p-8">
            
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X size={26} />
            </button>

            <div className="flex gap-6 mb-8 mt-2">
            
            <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-[22px] font-extrabold text-foreground uppercase leading-tight mb-4 pr-6 tracking-wide">
                {product.productName}
                </h2>
                <p className="text-lg font-bold text-muted-foreground mb-6">
                Price: ₱{(product.productPrice)?.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                In Stock: <span className="text-foreground">{availableStock}</span>
                </p>

                <div className="flex items-center gap-4">
                <label className="text-[16px] text-foreground font-bold">Quantity:</label>
                <div className="flex items-center gap-2">
                    <button 
                    onClick={handleDecrement}
                    className="w-10 h-10 flex items-center justify-center bg-secondary text-secondary-foreground font-bold rounded hover:bg-secondary/80 transition-colors text-xl"
                    >
                    -
                    </button>
                    
                    <input 
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 h-10 flex items-center justify-center border border-input rounded bg-transparent font-bold text-[18px] text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    
                    <button 
                    onClick={handleIncrement}
                    disabled={quantity >= availableStock}
                    className={`w-10 h-10 flex items-center justify-center font-bold rounded transition-colors text-xl ${
                        quantity >= availableStock 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                    >
                    +
                    </button>
                </div>
                </div>
            </div>

            <div className="w-40 h-40 shrink-0 rounded-md overflow-hidden bg-muted shadow-inner flex items-center justify-center relative">
                {product.productImageUrl ? (
                <img src={product.productImageUrl} alt="Product" className="w-full h-full object-cover" />
                ) : (
                <img src={logo} className="h-full object-contain drop-shadow-xl" />
                )}
            </div>

            </div>

            <button 
            onClick={handleAddClick}
            disabled={quantity === '' || quantity < 1 || quantity > availableStock}
            className="w-full bg-primary text-primary-foreground font-extrabold py-3.5 rounded hover:bg-primary/90 transition-colors tracking-widest text-[16px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
            ADD TO CHECKOUT
            </button>

        </div>
        </div>
    );
};

export default ProductModal;