import React from 'react';

const ProductCard = ({ name, type, gender, imageUrl, price, onAddToCart }) => {
  return (
    <div 
      onClick={onAddToCart} 
      className="flex flex-col cursor-pointer transition-transform hover:scale-[1.02] shadow-md border border-border rounded-lg overflow-hidden bg-card"
    >
      <div className="bg-card text-foreground font-extrabold text-center py-2 text-sm uppercase tracking-wider border-b border-border">
        {name}
      </div>
      
      <div className="h-40 bg-muted/50 w-full flex items-center justify-center p-2 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full object-contain drop-shadow-xl" />
        ) : (
          <div className="w-16 h-24 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-t-full shadow-2xl opacity-80"></div>
        )}
      </div>
      
      <div className="bg-secondary text-secondary-foreground text-center py-2 text-xs font-semibold tracking-widest border-t border-border">
        {type} / {gender}
      </div>
    </div>
  );
};

export default ProductCard;