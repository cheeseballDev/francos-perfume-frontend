import { Button } from "@/components/ui/button";
import { formatDateForTable, formatLabel } from "@/utils/formattingUtils";
import { Barcode } from "lucide-react";
import FrancoPerfumeLogo from '../../../assets/FrancoPerfumeLogo.png';

export const ProductCard = ({ product, isOwner, onEdit }) => {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-5 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-4 font-semibold">
        <div className="flex items-center gap-1 text-foreground">
          <Barcode size={14} />
          <span className="tracking-widest font-mono">
            {product.productBarcode || "N/A"}
          </span>
        </div>
        <span>
          ₱{product.productPrice?.toFixed(2) || "0.00"}
        </span>
      </div>

      <div className="grow flex justify-center items-center mb-8 bg-muted/50 rounded-lg overflow-hidden border border-border p-2">
        <img
          src={
            product.productImageUrl ||
            FrancoPerfumeLogo
          }
          alt={product.productName}
          className="h-32 w-32 object-contain"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
          <h3 className="font-bold text-sm text-foreground leading-tight">
            {product.productName}
          </h3>
          <span className="text-xs text-muted-foreground font-bold tracking-wider">
            {product.productDisplayId}
          </span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-xs font-medium text-foreground uppercase">
            {formatLabel(product.productType)} -{" "}
            {formatLabel(product.productGender)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDateForTable(product.productDateCreated)}
          </p>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {product.productDescription || "No description available."}
        </p>
      </div>

      {isOwner && (
        <Button
          onClick={() => onEdit(product)}
        >
          Edit Details
        </Button>
      )}
    </div>
  );
};