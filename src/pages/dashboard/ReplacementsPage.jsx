import NewReplacementModal from "@/components/features/replacement_components/NewReplacementModal";
import { replacementColumns } from "@/components/features/replacement_components/ReplacementColumns";
import ReplacementDetailsModal from "@/components/features/replacement_components/ReplacementDetailsModal";
import TransactionTableSkeleton from "@/components/loaders/TransactionTableSkeleton";
import { SearchFilterBar } from "@/components/shared";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useReplacement } from "@/hooks/replacement_hooks/useReplacement";
import { useRowSelection } from "@/hooks/useRowSelection";
import { useUrlSearch } from "@/hooks/useUrlSearch";
import { Eye, RefreshCcw } from "lucide-react";
import { useState } from "react";

export default function ReplacementsPage() {
    const {
        replacements,
        asyncState,
        pagination,
        filter,
        filterOptions,
        updateFilter,
        fetchReplacements,
    } = useReplacement();

    const [searchQuery, setSearchQuery] = useState("");
    const [isNewOpen, setIsNewOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useUrlSearch((query) => {
        setSearchQuery(query);
        updateFilter("search", query);
    });

    const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchQuery(query);
        updateFilter("search", query);
    };

    const {
        selected: selectedReplacement,
        toggleRow: handleRowClick,
        selectRow,
    } = useRowSelection("replacementId");

    return (
        <>
            <div className="bg-background min-h-screen font-montserrat flex flex-col animate-fade-in relative">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold text-foreground leading-none mb-2">Replacements</h1>
                        <p className="text-muted-foreground text-sm">Same-day exchanges of sold perfumes. No refunds.</p>
                    </div>
                </div>

                <SearchFilterBar
                    searchValue={searchQuery}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Search by replacement ID, sales order ID or perfume..."
                    filter={filter}
                    updateFilter={updateFilter}
                    filterOptions={filterOptions}
                    actions={
                        <Button onClick={() => setIsNewOpen(true)}>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            New Replacement
                        </Button>
                    }
                />

                {asyncState?.isLoading ? (
                    <TransactionTableSkeleton rowCount={10} />
                ) : (
                    <DataTable
                        columns={replacementColumns}
                        data={replacements}
                        keyField="replacementId"
                        asyncState={asyncState}
                        pagination={pagination}
                        filter={filter}
                        updateFilter={updateFilter}
                        onClearSearch={() => handleSearchChange('')}
                        selectedItem={selectedReplacement}
                        onRowClick={handleRowClick}
                        onRowDoubleClick={(row) => { selectRow(row); setIsDetailsOpen(true); }}
                        emptyMessage="No replacements yet."
                    />
                )}

                <div className="flex items-center justify-end w-full mt-4">
                    <Button
                        variant={selectedReplacement ? "default" : "ghost"}
                        disabled={!selectedReplacement}
                        onClick={() => setIsDetailsOpen(true)}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        View Replacement
                    </Button>
                </div>
            </div>

            {isNewOpen && (
                <NewReplacementModal
                    isOpen={isNewOpen}
                    onClose={() => setIsNewOpen(false)}
                    onSaved={fetchReplacements}
                />
            )}

            <ReplacementDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                replacement={selectedReplacement}
            />
        </>
    );
}
