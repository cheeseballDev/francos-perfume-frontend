import { archivedAccountColumns, archivedProductColumns } from "@/components/features/archive_components/ArchiveColumns";
import { useRowSelection } from "@/hooks/useRowSelection";
import ArchivedAccountDetailsModal from "@/components/features/archive_components/ArchivedAccountDetailsModal";
import ArchivedProductDetailsModal from "@/components/features/archive_components/ArchivedProductDetailsModal";
import { AccountArchiveSkeleton, ProductArchiveSkeleton } from "@/components/loaders/ArchiveTableSkeletons";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useAccountArchive } from "@/hooks/archive_hooks/useAccountArchive";
import { useProductArchive } from "@/hooks/archive_hooks/useProductArchive";
import { Eye } from "lucide-react";
import { useState } from "react";

const ArchivesPage = () => {
    const { 
        archivedAccounts, 
        asyncState: accountAsyncState, 
        pagination: accountPagination, 
        filter: accountFilter, 
        updateFilter: updateAccountFilter,
        fetchArchivedAccount,
        restoreArchivedAccount,
    } = useAccountArchive();

    const { 
        archivedProducts, 
        asyncState: productAsyncState, 
        pagination: productPagination, 
        filter: productFilter, 
        updateFilter: updateProductFilter,
        fetchArchivedProduct,
        restoreArchivedProduct,
    } = useProductArchive();

    
    const isAccountsLoading = accountAsyncState?.loading || accountAsyncState?.isLoading;
    const isProductsLoading = productAsyncState?.loading || productAsyncState?.isLoading;

    const [isArchivedAccountDetailsModalOpen, setIsArchivedAccountDetailsModalOpen] = useState(false);
    const [isArchivedProductDetailsModalOpen, setIsArchivedProductDetailsModalOpen] = useState(false);

    const {
        selected: selectedArchivedAccount,
        setSelected: setSelectedArchivedAccount,
        toggleRow: handleAccountRowClick,
        selectRow: selectAccountRow,
    } = useRowSelection("accountArchiveId", fetchArchivedAccount);

    const {
        selected: selectedArchivedProduct,
        setSelected: setSelectedArchivedProduct,
        toggleRow: handleProductRowClick,
        selectRow: selectProductRow,
    } = useRowSelection("productArchiveId", fetchArchivedProduct);

    return (
        <>
            <div className="flex flex-col h-full animate-fade-in font-montserrat pb-8 bg-background">

                <header className="mb-8 border-b border-border pb-6">
                    <h1 className="text-[32px] font-bold text-foreground mb-2 tracking-tight">Archives</h1>
                    <p className="text-muted-foreground text-sm">
                    A list of all archived items. Items stored for more than 30 days will be automatically deleted.
                    </p>
                </header>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Accounts Archives</h2>

                    {isAccountsLoading ? (
                        <AccountArchiveSkeleton rowCount={3} />
                        ) : (
                        <DataTable 
                            columns={archivedAccountColumns}
                            data={archivedAccounts}
                            keyField="accountArchiveId"
                            asyncState={accountAsyncState}
                            pagination={accountPagination}
                            filter={accountFilter}
                            updateFilter={updateAccountFilter}
                            selectedItem={selectedArchivedAccount}
                            onRowClick={handleAccountRowClick}
                            onRowDoubleClick={(row) => { selectAccountRow(row); setIsArchivedAccountDetailsModalOpen(true); }}
                        />
                        )}
                    <div className="flex justify-end">
                        <Button
                            variant={selectedArchivedAccount ? "default" : "ghost"}
                            disabled={!selectedArchivedAccount}
                            onClick={() => setIsArchivedAccountDetailsModalOpen(true)}
                        >
                            <Eye className="h-8 w-8"/>
                            View Details
                        </Button>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Products Archives</h2>

                    {isProductsLoading ? (
                        <ProductArchiveSkeleton rowCount={3} />
                        ) : (
                        <DataTable 
                            columns={archivedProductColumns}
                            data={archivedProducts}
                            keyField="productArchiveId"
                            asyncState={productAsyncState}
                            pagination={productPagination}
                            filter={productFilter}
                            updateFilter={updateProductFilter}
                            selectedItem={selectedArchivedProduct}
                            onRowClick={handleProductRowClick}
                            onRowDoubleClick={(row) => { selectProductRow(row); setIsArchivedProductDetailsModalOpen(true); }}
                        />
                        )}
                    <div className="flex justify-end">
                        <Button
                            variant={selectedArchivedProduct ? "default" : "ghost"}
                            disabled={!selectedArchivedProduct}
                            onClick={() => setIsArchivedProductDetailsModalOpen(true)}
                        >
                            <Eye className="h-8 w-8"/>
                            View Details
                        </Button>
                    </div>
                </section>
        </div>

        <ArchivedAccountDetailsModal
            isOpen={isArchivedAccountDetailsModalOpen}
            onClose={() => setIsArchivedAccountDetailsModalOpen(false)}
            selectedArchivedAcccount={selectedArchivedAccount}
            restoreArchivedAccount={restoreArchivedAccount}
            setSelectedArchivedAccount={setSelectedArchivedAccount}
        />

        <ArchivedProductDetailsModal
            isOpen={isArchivedProductDetailsModalOpen}
            onClose={() => setIsArchivedProductDetailsModalOpen(false)}
            selectedArchivedProduct={selectedArchivedProduct}
            restoreArchivedProduct={restoreArchivedProduct}
            setSelectedArchivedProduct={setSelectedArchivedProduct}
        />
        </>
        
    );
};

export default ArchivesPage;