import { archivedAccountColumns, archivedProductColumns } from "@/components/features/archive_components/ArchiveColumns";
import { AccountArchiveSkeleton, ProductArchiveSkeleton } from "@/components/loaders/ArchiveTableSkeletons";
import DataTable from "@/components/shared/DataTable";
import { useAccountArchive } from "@/hooks/archive_hooks/useAccountArchive";
import { useProductArchive } from "@/hooks/archive_hooks/useProductArchive";

const ArchivesPage = () => {
  const { 
    archivedProducts, 
    asyncState: productAsyncState, 
    pagination: productPagination, 
    filter: productFilter, 
    updateFilter: updateProductFilter 
  } = useProductArchive();

  const { 
    archivedAccounts, 
    asyncState: accountAsyncState, 
    pagination: accountPagination, 
    filter: accountFilter, 
    updateFilter: updateAccountFilter 
  } = useAccountArchive();

  // Helper boolean variables to check loading states cleanly.
  // Using both .loading and .isLoading just in case your hook uses one or the other.
  const isAccountsLoading = accountAsyncState?.loading || accountAsyncState?.isLoading;
  const isProductsLoading = productAsyncState?.loading || productAsyncState?.isLoading;

  return (
    <div className="flex flex-col h-full animate-fade-in font-montserrat pb-8 bg-background">

      {/* HEADER - Semantic colors applied */}
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-[32px] font-bold text-foreground mb-2 tracking-tight">Archives</h1>
        <p className="text-muted-foreground text-sm">
          A list of all archived items. Items stored for more than 30 days will be automatically deleted.
        </p>
      </header>

      {/* ACCOUNTS SECTION */}
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
          />
        )}
      </section>

      {/* PRODUCTS SECTION */}
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
          />
        )}
      </section>

    </div>
  );
};

export default ArchivesPage;