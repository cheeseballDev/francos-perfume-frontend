import { transactionColumns } from '@/components/features/transactions_components/TransactionColumns';
import TransactionDetailsModal from '@/components/features/transactions_components/TransactionDetailsModal';
import TransactionTableSkeleton from '@/components/loaders/TransactionTableSkeleton';
import { SearchBar } from '@/components/shared';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { useTransaction } from '@/hooks/transaction_hooks/useTransaction';
import { Eye, FileDown, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import ExportTransactionModal from "../../components/features/transactions_components/ExportTransactionModal";

export default function TransactionsPage() {
    const { 
        transactions,
        asyncState, 
        pagination, 
        filter, 
        fetchTransactions, 
        updateFilter,
        fetchTransactionDetails
    } = useTransaction();

    const [searchQuery, setSearchQuery] = useState('');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

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

        setSelectedTransaction(row);
        //console.log(selectedTransaction);    
        const transaction = await fetchTransactionDetails(row.salesOrderId);
        if (transaction) {
            setSelectedTransaction(prev => prev ? { ...prev, ...transaction }: transaction);
        }
    }


    return (
        <div className="bg-background min-h-screen font-montserrat flex flex-col animate-fade-in relative">
            
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[32px] font-bold text-foreground leading-none mb-2">Transaction History</h1>
                    <p className="text-muted-foreground text-sm">View all POS sales.</p>
                </div>
            </div>

            <div className="relative flex justify-between gap-6 mt-4 shrink-0 mb-6">
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                />

                <Button
                    onClick={fetchTransactions}
                    className='justify-end'
                >
                    <RefreshCcw className='w-4 h-4'/>
                    Refresh Status
                </Button>

            </div>


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
                    onRowDoubleClick={() => setIsTransactionModalOpen(true)}
                />
            )}

            <div className="relative flex justify-between gap-6 mt-4">
                <Button
                    onClick={() => setIsExportModalOpen(true)}
                    >
                    <FileDown className='h-8 w-8'/>
                    Export
                </Button>

                <Button
                    onClick={() => setIsTransactionModalOpen(true)}
                >
                    <Eye className='h-8 w-8'/>
                    View Transaction
                </Button>
            </div>
            
            <ExportTransactionModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)}
            />

            <TransactionDetailsModal 
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                selectedTransaction={selectedTransaction}
            />

        </div>
    );
}