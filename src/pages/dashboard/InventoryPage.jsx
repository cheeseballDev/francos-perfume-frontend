import InventoryTable from "@/components/features/inventory_components/InventoryTable";
import TableSkeleton from "@/components/loaders/TableSkeleton";
import { formatDateForInput, formatDateForTable } from "@/utils/formattingUtils";
import { useState } from "react";
import EditBatchModal from "../../components/features/inventory_components/EditBatchModal";
import FilterDropDown from "../../components/shared/FilterDropDown";
import SearchBar from "../../components/shared/SearchBar";
import { useInventory } from "../../hooks/inventory_hooks/useInventory";

const InventoryPage = () => {
    const { 
        inventory, 
        asyncState, 
        pagination, 
        filter, 
        updateFilter, 
        fetchBatchesForProduct, 
        saveBatchEdit, 
        filterOptions 
    } = useInventory();
    
    const [searchQuery, setSearchQuery] = useState(""); 
    const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batchMap, setBatchMap] = useState({});

    const handleOpenEditBatchModal = (batch, product) => {
        const formattedReceivedDate = formatDateForTable(batch.dateReceived);
        const formattedExpiryDate = formatDateForInput(batch.expiryDate);
        setSelectedBatch({ 
            ...batch,
            branchId: product.branchId,
            branchName: product.branchName,
            batchDisplayId: batch.batchDisplayId,
            productDisplayId: product.productDisplayId,
            productId: product.productId,
            productName: product.productName,
            quantity: batch.quantity,
            expiryDate: formattedExpiryDate,
            dateReceived: formattedReceivedDate
        });
        setIsEditBatchModalOpen(true);
    };

    const handleSaveBatchWrapper = async (batchId, dto) => {
        await saveBatchEdit(batchId, dto);
    
        if (selectedBatch) {
            const freshBatches = await fetchBatchesForProduct(selectedBatch.productId, selectedBatch.branchId);
            const mapped = (freshBatches || []).map(b => ({
                batchDisplayId: b.batchDisplayId,
                batchId: b.batchId,
                dateReceived: b.createdAt,
                expiryDate: b.expiryDate ? formatDateForInput(b.expiryDate) : 'N/A',
                quantity: b.quantity
            }));

            const rowKey = `${selectedBatch.productDisplayId}-${selectedBatch.branchName}`;

            setBatchMap(prev => ({
                ...prev,
                [rowKey]: mapped
            }));
        }
        
        setIsEditBatchModalOpen(false);
    };

    const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchQuery(query);
        updateFilter('search', query);
        updateFilter('pageCount', 1)
    }
  
  return (
    <div className="flex flex-col h-screen overflow-auto-y animate-fade-in relative font-montserrat">
        <div className="flex justify-between items-end mb-6">
            <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-2">
                Inventory
            </h1>
            <p className="text-muted-foreground text-sm">
                Overview of all available parfum products
            </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="w-full sm:max-w-md">
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="w-full sm:w-auto">
                <FilterDropDown 
                    filter={filter}
                    updateFilter={updateFilter}
                    filterOptions={filterOptions}
                />
            </div>
        </div>

      <div className="flex flex-col gap-4 pb-4 flex-1">
        {asyncState?.isLoading ? (
          <TableSkeleton rowCount={8} columnCount={6} />
        ) : (
          <InventoryTable
            inventory={inventory}
            asyncState={asyncState}
            pagination={pagination}
            batchMap={batchMap}
            setBatchMap={setBatchMap}
            fetchBatchesForProduct={fetchBatchesForProduct}
            handleSaveBatchEdit={handleSaveBatchWrapper}
            filter={filter}
            updateFilter={updateFilter}
            handleOpenEditBatchModal={handleOpenEditBatchModal}
          />
        )}
      </div>

      <EditBatchModal
        key={selectedBatch?.batchId}
        isOpen={isEditBatchModalOpen}
        onClose={() => setIsEditBatchModalOpen(false)}
        selectedBatch={selectedBatch}
        handleSaveBatchWrapper={handleSaveBatchWrapper}
      />  
    </div>
  );
};

export default InventoryPage;