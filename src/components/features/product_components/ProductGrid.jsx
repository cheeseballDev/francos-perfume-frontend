import { ProductCard } from "./ProductCard";

const ProductGrid = ({ products = [], isOwner, openEditModal }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground bg-card rounded-xl border border-border shadow-sm flex-1">
        No products found matching your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 flex-1 content-start">
      {products.map((product) => (
        <ProductCard
          key={product.productId}
          product={product}
          isOwner={isOwner}
          onEdit={openEditModal}
        />
      ))}
    </div>
  );
};

export default ProductGrid;