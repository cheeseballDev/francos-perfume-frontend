import { useAuth } from "@/auth/UseAuth";
import { archivedAccountColumns, archivedProductColumns } from "@/components/features/archive_components/ArchiveColumns";
import { useRowSelection } from "@/hooks/useRowSelection";
import ArchivedAccountDetailsModal from "@/components/features/archive_components/ArchivedAccountDetailsModal";
import ArchivedProductDetailsModal from "@/components/features/archive_components/ArchivedProductDetailsModal";
import { AccountArchiveSkeleton, ProductArchiveSkeleton } from "@/components/loaders/ArchiveTableSkeletons";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useAccountArchive } from "@/hooks/archive_hooks/useAccountArchive";
import { useProductArchive } from "@/hooks/archive_hooks/useProductArchive";
import { Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const SearchNotice = ({ search, onClear }) => (
    <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2 rounded-lg border border-border bg-muted/50 text-sm">
        <span className="text-muted-foreground">
            Showing results for <span className="font-semibold text-foreground">{search}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" /> Clear
        </Button>
    </div>
);

const ProductArchivesSection = ({ urlSearch = "", onClearSearch }) => {
    const {
        archivedProducts,
        asyncState: productAsyncState,
        pagination: productPagination,
        filter: productFilter,
        updateFilter: updateProductFilter,
        fetchArchivedProduct,
        restoreArchivedProduct,
    } = useProductArchive();

    useEffect(() => {
        if ((productFilter.search || "") !== urlSearch) updateProductFilter('search', urlSearch);
    }, [urlSearch]);

    const isProductsLoading = productAsyncState?.loading || productAsyncState?.isLoading;

    const [isArchivedProductDetailsModalOpen, setIsArchivedProductDetailsModalOpen] = useState(false);

    const {
        selected: selectedArchivedProduct,
        setSelected: setSelectedArchivedProduct,
        toggleRow: handleProductRowClick,
        selectRow: selectProductRow,
    } = useRowSelection("productArchiveId", fetchArchivedProduct);

    return (
        <>
            <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Products Archives</h2>

                {urlSearch && <SearchNotice search={urlSearch} onClear={onClearSearch} />}

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

const ArchivesPage = () => {
    const { user } = useAuth();
    const canViewArchivedProducts = (user?.trueRole || "") === "OWNER";

    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get("search") || "";
    const isProductSearch = searchParams.get("section") === "products";
    const accountSearch = isProductSearch ? "" : urlSearch;
    const productSearch = isProductSearch ? urlSearch : "";
    const clearUrlSearch = () => setSearchParams({}, { replace: true });

    const { 
        archivedAccounts, 
        asyncState: accountAsyncState, 
        pagination: accountPagination, 
        filter: accountFilter, 
        updateFilter: updateAccountFilter,
        fetchArchivedAccount,
        restoreArchivedAccount,
    } = useAccountArchive();

    useEffect(() => {
        if ((accountFilter.search || "") !== accountSearch) updateAccountFilter('search', accountSearch);
    }, [accountSearch]);

    const isAccountsLoading = accountAsyncState?.loading || accountAsyncState?.isLoading;

    const [isArchivedAccountDetailsModalOpen, setIsArchivedAccountDetailsModalOpen] = useState(false);

    const {
        selected: selectedArchivedAccount,
        setSelected: setSelectedArchivedAccount,
        toggleRow: handleAccountRowClick,
        selectRow: selectAccountRow,
    } = useRowSelection("accountArchiveId", fetchArchivedAccount);

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

                    {accountSearch && <SearchNotice search={accountSearch} onClear={clearUrlSearch} />}

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

                {canViewArchivedProducts && (
                    <ProductArchivesSection urlSearch={productSearch} onClearSearch={clearUrlSearch} />
                )}
        </div>

        <ArchivedAccountDetailsModal
            isOpen={isArchivedAccountDetailsModalOpen}
            onClose={() => setIsArchivedAccountDetailsModalOpen(false)}
            selectedArchivedAcccount={selectedArchivedAccount}
            restoreArchivedAccount={restoreArchivedAccount}
            setSelectedArchivedAccount={setSelectedArchivedAccount}
        />
        </>
        
    );
};

export default ArchivesPage;