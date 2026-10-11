import CreateProductModal from '@/components/features/product_components/CreateProductModal';
import EditProductModal from '@/components/features/product_components/EditProductModal';
import ProductGrid from '@/components/features/product_components/ProductGrid';
import ProductGridSkeleton from '@/components/loaders/ProductGridSkeleton';
import { FilterDropDown, SearchBar } from '@/components/shared';
import PaginationBar from '@/components/shared/PaginationBar';
import { Button } from '@/components/ui/button';
import { useProduct } from '@/hooks/product_hooks/useProduct';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../auth/UseAuth';

export default function ProductsPage() {
    const { user } = useAuth();
    const { 
        products,
        asyncState,
        pagination,
        filter,
        updateFilter,
        filterOptions,
        getProduct,
        updateProduct,
        createProduct
    } = useProduct();

    const isOwner = user?.trueRole === 'OWNER';
    const [searchQuery, setSearchQuery] = useState('');

    const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchQuery(query);
        updateFilter('search', query);
    }

    const handleOpenEditModal = (product) => {
        setSelectedProduct(product);
        setIsEditProductModalOpen(true);
    };

    return (
        <div className="bg-background min-h-screen font-montserrat relative flex flex-col">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Products</h1>
                    <p className="text-sm text-muted-foreground mt-1">List of all available products and details</p>
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

                    {isOwner && (
                        <Button
                            onClick={() => setIsCreateProductModalOpen(true)}
                            className="w-full sm:w-auto shrink-0"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create New Product
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

            {asyncState?.isLoading ? (
                <ProductGridSkeleton count={6} />
            ) : (
                <ProductGrid 
                    products={products}
                    isOwner={isOwner}
                    openEditModal={handleOpenEditModal}
                />
            )}
            
            <PaginationBar
                pageCount={filter.pageCount}
                pageSize={filter.pageSize}
                totalPages={pagination.totalPages}
                totalEntries={pagination.totalEntries}
                updateFilter={updateFilter}
            />

            <CreateProductModal
                isOpen={isCreateProductModalOpen}
                onClose={() => setIsCreateProductModalOpen(false)}
                filterOptions={filterOptions}
                createProduct={createProduct}
            />

            <EditProductModal
                isOpen={isEditProductModalOpen}
                onClose={() => setIsEditProductModalOpen(false)}
                selectedProduct={selectedProduct}
                filterOptions={filterOptions}
                updateProduct={updateProduct}
            /> 

        </div>
    );
}