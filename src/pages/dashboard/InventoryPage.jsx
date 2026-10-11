import { useAuth } from "@/auth/UseAuth";
import InventoryTable from "@/components/features/inventory_components/InventoryTable";
import TableSkeleton from "@/components/loaders/TableSkeleton";
import { Button } from "@/components/ui/button";
import { formatDateForInput } from "@/utils/formattingUtils";
import { Plus } from "lucide-react";
import { useState } from "react";
import EditBatchModal from "../../components/features/inventory_components/EditBatchModal";
import FilterDropDown from "../../components/shared/FilterDropDown";
import SearchBar from "../../components/shared/SearchBar";
import { useInventory } from "../../hooks/inventory_hooks/useInventory";

const InventoryPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(""); 
  
  const { inventory, asyncState, pagination, filter, updateFilter, fetchBatchesForProduct, saveBatchEdit, filterOptions } = useInventory();

  const [isCreateNewProductModalOpen, setIsCreateNewProductModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const [batchMap, setBatchMap] = useState([]);

  const handleOpenEditBatchModal = (batch, product) => {
    const date = batch.targetDate || batch.dateReceived;
    const formattedTargetDate = date ? formatDateForInput(date) : null;
        setEditingBatch({ 
          ...batch,
          branchId: batch.branchId,
          batchDisplayId: batch.batchDisplayId,
          productName: product.productName,
          quantity: batch.quantity,
          targetDate: formattedTargetDate
        });
        setIsEditBatchModalOpen(true);
    };
  
  const handleSearchChange = (value) => {
    const query = value?.target ? value.target.value : value;
    setSearchQuery(query);
    updateFilter('search', query);
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

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:max-w-xl">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

        {user.trueRole === 'OWNER' && (
          <Button
            onClick={() => setIsCreateNewProductModalOpen(true)}
            className="w-full sm:w-auto shrink-0"
          >
            <Plus className="h-5 w-5" />
            Add Stock
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
            handleSaveBatchEdit={saveBatchEdit}
            filter={filter}
            updateFilter={updateFilter}
            handleOpenEditBatchModal={handleOpenEditBatchModal}
          />
        )}
      </div>

      <EditBatchModal
        key={editingBatch?.batchId || "empty"}
        isOpen={isEditBatchModalOpen}
        onClose={() => setIsEditBatchModalOpen(false)}
        batch={editingBatch}
        onSave={async (submittedBatchData) => {
          await saveBatchEdit(submittedBatchData);
          setIsEditBatchModalOpen(false)
          setBatchMap(prev => {
            const next = {...prev};
            delete next[`${submittedBatchData.productId}-${submittedBatchData.branchId}`]
            return next;
          })
        }}
      />  
    </div>
  );
};

export default InventoryPage;