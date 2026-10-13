import { accountColumns } from "@/components/features/accounts_components/AccountColumns";
import AccountInfoModal from "@/components/features/accounts_components/AccountDetailsModal";
import CreateAccountModal from "@/components/features/accounts_components/CreateAccountModal";
import EditAccountModal from "@/components/features/accounts_components/EditAccountModal";
import AccountTableSkeleton from "@/components/loaders/AccountTableSkeleton";
import { FilterDropDown } from "@/components/shared";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/account_hooks/useAccount";
import { Eye, Plus } from "lucide-react";
import { useState } from "react";
import SearchBar from "../../components/shared/SearchBar";

const ManageAccountsPage = () => {
    const { 
        accounts, 
        asyncState,
        pagination,
        filter,
        updateFilter,
        fetchAccount,
        archive,
        toggleStatus,
        resetPassword,
        filterOptions,
        updateAccount,
        createAccount,
    } = useAccount();

    const [searchQuery, setSearchQuery] = useState(""); 
    const [selectedAccount, setSelectedAccount] = useState(null);
    
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
    const [isAccountInfoModalOpen, setIsAccountInfoModalOpen] = useState(false);
    const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

    const role = sessionStorage.getItem("trueRole");

    const handleRowClick = async (row) => {
        if (selectedAccount?.employeeId === row.employeeId) {
            setSelectedAccount(null);
            return;
        }
        setSelectedAccount(row);    

        const profile = await fetchAccount(row.employeeId);
            if (profile) {
            setSelectedAccount(prev => prev ? { ...prev, ...profile }: profile);
        }
    }

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
            onClick={() => setIsCreateAccountModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Account
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
          onRowDoubleClick={() => setIsAccountInfoModalOpen(true)}
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
      archive={archive}
      toggleStatus={toggleStatus}
      resetPassword={resetPassword}
      setIsEditAccountModalOpen={setIsEditAccountModalOpen}
    />

    <EditAccountModal 
      isOpen={isEditAccountModalOpen}
      onClose={() => setIsEditAccountModalOpen(false)}
      selectedAccount={selectedAccount}
      filterOptions={filterOptions}
      updateAccount={updateAccount}
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