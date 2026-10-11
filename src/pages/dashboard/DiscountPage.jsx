import { useAuth } from "@/auth/UseAuth";
import CreateDiscountModal from "@/components/features/discount_components/CreateDiscountModal";
import { discountColumns } from "@/components/features/discount_components/DiscountColumns";
import DiscountInfoModal from "@/components/features/discount_components/DiscountInfoModal";
import EditDiscountModal from "@/components/features/discount_components/EditDiscountModal";
import DiscountTableSkeleton from "@/components/loaders/DiscountTableSkeleton";
import { FilterDropDown, SearchBar } from "@/components/shared";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useDiscounts } from "@/hooks/discount_hooks/useDiscount";
import { Eye, Plus } from "lucide-react"; 
import { useState } from "react";

const DiscountPage = () => {
  const { user } = useAuth();
  const {
      discounts, 
      asyncState,
      pagination,
      filter,
      updateFilter,
      filterOptions,
      createDiscount,
      fetchDiscount,
      removeDiscount,
      toggleStatus,
      updateDiscount,
  } = useDiscounts();

  const role = user.trueRole;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isCreateDiscountModalOpen, setIsCreateDiscountModalOpen] = useState(false);
  const [isDiscountInfoModalOpen, setIsDiscountInfoModalOpen] = useState(false);
  const [isEditDiscountModalOpen, setIsEditModalDiscountModalOpen] = useState(false);

  const handleRowClick = async (row) => {
    if (selectedDiscount?.discountId === row.discountId) {
      setSelectedDiscount(null);
      return;
    }

    setSelectedDiscount(row);    

    const discount = await fetchDiscount(row.discountId);
    if (discount) {
      setSelectedDiscount(prev => prev ? { ...prev, ...discount }: discount);
    }
  }

  
  const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchQuery(query);
        updateFilter('search', query);
    }

  return (
    <div className="flex flex-col h-full animate-fade-in relative font-montserrat">

      <h1 className="text-3xl font-bold text-foreground mb-1 leading-none tracking-tight">Discount Management</h1>
      
      <p className="text-muted-foreground text-sm mb-8">Create, remove, and change discounts</p>
        
        <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:max-w-xl">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

        {role !== 'MANAGER' && (
          <Button
            onClick={() => setIsCreateDiscountModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Discount
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

    <h2 className="text-2xl font-bold text-foreground mb-6">Discounts List</h2>

    {asyncState?.isLoading ? (
      <DiscountTableSkeleton rowCount={5} />
    ) : (
      <div className="overflow-y-auto h-screen min-h-100"
        onClick={(e) => e.stopPropagation()}>
        <DataTable 
          columns={discountColumns}
          data={discounts}
          keyField="discountId"
          asyncState={asyncState}
          pagination={pagination}
          filter={filter}
          updateFilter={updateFilter}
          selectedItem={selectedDiscount}
          onRowClick={handleRowClick}
          onRowDoubleClick={() => setIsDiscountInfoModalOpen(true)}
        />
      </div>
    )}

    <div className="flex justify-end mt-4">
      <Button
        variant={selectedDiscount ? "default" : "ghost"}
        disabled={!selectedDiscount}
        onClick={() => setIsDiscountInfoModalOpen(true)}
        >
        <Eye className="h-8 w-8"/>
        View Discount
      </Button>
    </div>

    <CreateDiscountModal 
        isOpen={isCreateDiscountModalOpen} 
        onClose={() => setIsCreateDiscountModalOpen(false)}
        filterOptions={filterOptions}
        createDiscount={createDiscount}
    />

    <DiscountInfoModal 
        isOpen={isDiscountInfoModalOpen}
        onClose={() => setIsDiscountInfoModalOpen(false)}
        selectedDiscount={selectedDiscount}
        setSelectedDiscount={setSelectedDiscount}
        removeDiscount={removeDiscount}
        toggleStatus={toggleStatus}
        setIsEditDiscountModalOpen={setIsEditModalDiscountModalOpen}
    />

    <EditDiscountModal 
        isOpen={isEditDiscountModalOpen} 
        onClose={() => setIsEditModalDiscountModalOpen(false)}
        selectedDiscount={selectedDiscount}
        filterOptions={filterOptions} 
        updateDiscount={updateDiscount}
    />

    </div>
  );
};

export default DiscountPage;