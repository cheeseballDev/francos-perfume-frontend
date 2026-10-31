import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import PaginationBar from "@/components/shared/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateForInput, formatDateForTable } from '@/utils/formattingUtils';
import { stockLevel } from '@/utils/statusUtils';
import { ChevronDown, ChevronUp, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import perfumePlaceholder from "../../../assets/FrancoPerfumeLogo.png";

const InventoryTable = ({inventory, asyncState, pagination, fetchBatchesForProduct, batchMap, setBatchMap, filter, updateFilter, handleOpenEditBatchModal}) => {

    const [expandedRows, setExpandedRows] = useState({});
    
    const toggleRow = (rowKey) => {
        setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
    };

    const handleToggleRow = async(productId, branchId, rowKey) => {
    toggleRow(rowKey);        
        if (!batchMap[rowKey]) {
        const batches = await fetchBatchesForProduct(productId, branchId);
        const mapped = (batches || []).map(b => ({
            batchDisplayId: b.batchDisplayId,
            batchId: b.batchId,
            dateReceived: b.createdAt,
            expiryDate: b.expiryDate
              ? formatDateForInput(b.expiryDate)  
              : 'N/A',
            quantity: b.quantity
        }))
        setBatchMap(prev => ({...prev, [rowKey]: mapped}))
        }
    }

    return (
        <>
        <div className="flex flex-col gap-4 pb-4 flex-1">
        {asyncState.isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            Loading inventory data...
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No products found.</div>
        ) : (
          inventory.map((product) => {
            const rowKey = `${product.productDisplayId}-${product.branchName}`;
            const isExpanded = expandedRows[rowKey];
            const displayUnits = product.productQuantity || 0;
            const totalBatches = product.productBatchCount || 0;
            const stock = stockLevel(displayUnits);

            return (
              <div key={rowKey} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden transition-all shrink-0">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => handleToggleRow(product.productId, product.branchId, rowKey)}>
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground p-2">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    
                    <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0">
                      <img src={product.productImageUrl || perfumePlaceholder} alt="Product" className="object-cover h-10 w-10 opacity-60" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-foreground leading-none">{product.productName || "Unknown Product"}</h3>
                        {stock.label && (
                          <Badge variant="outline" className={`h-5 border text-[10px] uppercase font-bold tracking-wider ${stock.badgeClass}`}>
                            {stock.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`h-5 border text-xs ${product.branchName?.toUpperCase() === 'WAREHOUSE' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                          {product.branchName?.toUpperCase() || "UNKNOWN BRANCH"}
                        </Badge>
                        <Badge variant="outline" className="h-5 bg-blue-500/10 text-blue-600 border-blue-500/20">{product.productType}</Badge>
                        <Badge variant="outline" className="h-5 bg-pink-500/10 text-pink-600 border-pink-500/20">{product.productGender}</Badge>
                        {product.stockWarning.toUpperCase() === "SLOW MOVING" &&
                            <Badge variant="outline" className="h-5 bg-red-500/10 text-red-600 border-red-500/20">SLOW MOVING</Badge>
                        }

                      </div>
                    </div>
                  </div>

                  <div className="text-right pr-4">
                    <p className={`font-bold text-lg tabular-nums ${stock.textClass}`}>{displayUnits} units</p>
                    <p className="text-xs text-foreground">{totalBatches} {totalBatches === 1 ? "batch" : "batches"}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-4">
                    {totalBatches === 0 ? (
                      <div className="text-center py-6 font-bold text-muted-foreground bg-background border border-border rounded-md tracking-widest text-sm">
                        NO AVAILABLE BATCH FOUND
                      </div>
                    ) : (
                      <div className="bg-background border border-border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableHead className="font-semibold text-muted-foreground">Batch ID</TableHead>
                              <TableHead className="font-semibold text-muted-foreground">Date Received</TableHead>
                              <TableHead className="font-semibold text-muted-foreground">Target Date</TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-center">Quantity</TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-right pr-6">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(batchMap[rowKey] || []).map((batch) => (
                              <TableRow key={batch.batchId}>
                                <TableCell className="font-medium text-foreground">{batch.batchId || 0}</TableCell>
                                <TableCell className="text-foreground">{formatDateForTable(batch.dateReceived)}</TableCell>
                                <TableCell className="text-foreground">{formatDateForTable(batch.expiryDate)}</TableCell>
                                <TableCell className="text-center text-foreground tabular-nums">{batch.quantity || 0}</TableCell>
                                <TableCell className="text-right pr-4">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs flex items-center gap-1.5 ml-auto"
                                    onClick={() => handleOpenEditBatchModal(batch, product)}>
                                    <Edit size={12} /> Edit Batch
                                  </Button>
                                </TableCell>
                              </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {inventory.length > 0 && !asyncState.isLoading && (
        <PaginationBar
          pageCount={filter.pageCount}
          pageSize={filter.pageSize}
          totalPages={pagination.totalPages}
          totalEntries={pagination.totalEntries}
          updateFilter={updateFilter}
        />
      )}
      </>
        
    )
}

export default InventoryTable;