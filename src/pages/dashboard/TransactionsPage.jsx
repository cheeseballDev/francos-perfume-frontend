import { useAuth } from '@/auth/UseAuth';
import ImportTransactionModal from '@/components/features/transactions_components/ImportTransactionModal';
import { transactionColumns } from '@/components/features/transactions_components/TransactionColumns';
import TransactionDetailsModal from '@/components/features/transactions_components/TransactionDetailsModal';
import TransactionTableSkeleton from '@/components/loaders/TransactionTableSkeleton';
import { SearchFilterBar } from '@/components/shared';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { useTransaction } from '@/hooks/transaction_hooks/useTransaction';
import { Eye, FileDown, Upload } from 'lucide-react';
import { useState } from 'react';
import ExportTransactionModal from "../../components/features/transactions_components/ExportTransactionModal";

export default function TransactionsPage() {
    const { user } = useAuth();

    const isOwner = user.trueRole === "OWNER";

    const { 
        transactions,
        asyncState, 
        pagination, 
        filter,
        filterOptions,
        updateFilter,
        fetchTransactionDetails
    } = useTransaction();

    const [searchQuery, setSearchQuery] = useState('');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isTransactionDetailsModalOpen, setIsTransactionDetailsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchQuery(query);
        updateFilter('search', query);
    }

    const handleRowClick = async (row) => {
        if (selectedTransaction?.salesOrderId === row.salesOrderId) {
            setSelectedTransaction(null);
            return;
        }
        const transaction = await fetchTransactionDetails(row.salesOrderId);
        if (transaction) {
            setSelectedTransaction(prev => prev ? { ...prev, ...transaction }: transaction);
        }
    }



    return (
        <>
            <div className="bg-background min-h-screen font-montserrat flex flex-col animate-fade-in relative">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold text-foreground leading-none mb-2">Transaction History</h1>
                        <p className="text-muted-foreground text-sm">View all POS sales.</p>
                    </div>
                </div>

                <SearchFilterBar
                    searchValue={searchQuery}
                    onSearchChange={handleSearchChange}
                    filter={filter}
                    updateFilter={updateFilter}
                    filterOptions={filterOptions}
                />

                {asyncState?.isLoading ? (
                    <TransactionTableSkeleton rowCount={10} />
                ) : (
                    <DataTable
                        columns={transactionColumns}
                        data={transactions}
                        keyField="salesOrderId"
                        asyncState={asyncState}
                        pagination={pagination}
                        filter={filter}
                        updateFilter={updateFilter}
                        selectedItem={selectedTransaction}
                        onRowClick={handleRowClick}
                        onRowDoubleClick={() => setIsTransactionDetailsModalOpen(true)}
                    />
                )}

            <div className="flex items-center justify-between w-full mt-4">
                <div className="flex items-center gap-4">
                    <Button onClick={() => setIsExportModalOpen(true)}>
                        <FileDown className='h-4 w-4 mr-2'/>
                        Export Transactions
                    </Button>

                    {isOwner &&
                        <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                            <Upload className='h-4 w-4 mr-2' />
                            Import Transactions
                        </Button>
                    }
                    
                </div>

                <Button
                    variant={selectedTransaction ? "default" : "ghost"}
                    disabled={!selectedTransaction}
                    onClick={() => setIsTransactionDetailsModalOpen(true)}
                >
                    <Eye className='h-4 w-4 mr-2'/>
                    View Transaction
                </Button>
            </div>
        </div>
            <ExportTransactionModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)}
            />

            <TransactionDetailsModal 
                isOpen={isTransactionDetailsModalOpen}
                onClose={() => setIsTransactionDetailsModalOpen(false)}
                selectedTransaction={selectedTransaction}
            />
        
            <ImportTransactionModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </>
    );
}