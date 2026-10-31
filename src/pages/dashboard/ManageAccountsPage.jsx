import { useAuth } from "@/auth/UseAuth";
import { accountColumns } from "@/components/features/accounts_components/AccountColumns";
import AccountInfoModal from "@/components/features/accounts_components/AccountDetailsModal";
import CreateAccountModal from "@/components/features/accounts_components/CreateAccountModal";
import EditAccountModal from "@/components/features/accounts_components/EditAccountModal";
import AccountTableSkeleton from "@/components/loaders/AccountTableSkeleton";
import { SearchFilterBar } from "@/components/shared";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/account_hooks/useAccount";
import { useRowSelection } from "@/hooks/useRowSelection";
import { Eye, Plus } from "lucide-react";
import { useState } from "react";

const ManageAccountsPage = () => {
    const { user } = useAuth();
    const { 
        accounts, 
        asyncState,
        pagination,
        filter,
        updateFilter,
        fetchAccountDetails,
        archiveAccount,
        toggleAccountStatus,
        resetPassword,
        filterOptions,
        updateAccount,
        createAccount,
    } = useAccount();

    const [searchQuery, setSearchQuery] = useState(""); 
    
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
    const [isAccountInfoModalOpen, setIsAccountInfoModalOpen] = useState(false);
    const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

    const role = user?.trueRole;

    const {
        selected: selectedAccount,
        setSelected: setSelectedAccount,
        toggleRow: handleRowClick,
        selectRow,
    } = useRowSelection("employeeId", fetchAccountDetails);

    const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchQuery(query);
        updateFilter('search', query);
    }

  return (
    <div className="flex flex-col animate-fade-in font-montserrat h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight leading-none">
        Manage Accounts
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Manage, create, and modify accounts of each user
      </p>

      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        filter={filter}
        updateFilter={updateFilter}
        filterOptions={filterOptions}
        className="mb-8"
        actions={role !== 'MANAGER' && (
          <Button
            onClick={() => setIsCreateAccountModalOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Account
          </Button>
        )}
      />

    <h2 className="text-2xl font-bold text-foreground mb-6">Accounts List</h2>

    {asyncState?.isLoading ? (
      <AccountTableSkeleton rowCount={10} />
    ) : (
        <DataTable 
          columns={accountColumns}
          data={accounts}
          keyField="employeeId"
          asyncState={asyncState}
          pagination={pagination}
          filter={filter}
          updateFilter={updateFilter}
          selectedItem={selectedAccount}
          onRowClick={handleRowClick}
          onRowDoubleClick={(row) => { selectRow(row); setIsAccountInfoModalOpen(true); }}
        />
    )}

    <CreateAccountModal 
      isOpen={isCreateAccountModalOpen} 
      onClose={() => setIsCreateAccountModalOpen(false)}
      filterOptions={filterOptions}
      createAccount={createAccount}
    />

    <AccountInfoModal
      isOpen={isAccountInfoModalOpen}
      onClose={() => setIsAccountInfoModalOpen(false)}
      selectedAccount={selectedAccount}
      archiveAccount={archiveAccount}
      toggleAccountStatus={toggleAccountStatus}
      resetPassword={resetPassword}
      setIsEditAccountModalOpen={setIsEditAccountModalOpen}
      setSelectedAccount={setSelectedAccount}
    />

    <EditAccountModal 
      isOpen={isEditAccountModalOpen}
      onClose={() => setIsEditAccountModalOpen(false)}
      selectedAccount={selectedAccount}
      filterOptions={filterOptions}
      updateAccount={updateAccount}
      setSelectedAccount={setSelectedAccount}
    />

    <div className="flex justify-end mt-4">
      <Button
        variant={selectedAccount ? "default" : "ghost"}
        disabled={!selectedAccount}
        onClick={() => setIsAccountInfoModalOpen(true)}
        >
        <Eye className="h-8 w-8"/>
        View Account
      </Button>
    </div>

    </div>
  );
};

export default ManageAccountsPage;