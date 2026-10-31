import { useAuth } from "@/auth/UseAuth";
import { useRowSelection } from "@/hooks/useRowSelection";
import { requestColumns } from "@/components/features/request_components/RequestColumns";
import RequestTableSkeleton from "@/components/loaders/RequestTableSkeleton";
import { SearchFilterBar } from "@/components/shared";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useRequest } from "@/hooks/request_hooks/useRequest";
import { ArrowDownLeft, ArrowUpRight, Eye, ListFilter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const RequestPage = () => {
    const navigate = useNavigate(); 
    const { user } = useAuth();
    const {
        requests,
        asyncState,
        pagination,
        filter,
        updateFilter,
        filterOptions,
    } = useRequest();
    
    const [searchParams, setSearchParams] = useSearchParams();

    const searchQuery = searchParams.get('search') || '';
    const activeTab = searchParams.get('direction') || '';


    useEffect(() => {
        updateFilter('direction', activeTab);
        updateFilter('search', searchQuery);
    }, [activeTab, searchQuery]);

    const handleTabChange = (direction) => {
        setSearchParams(prev => {
            if (direction) prev.set("direction", direction);
            else prev.delete("direction");
            return prev;
        });
        updateFilter('direction', direction);
    };

    const {
        selected: selectedRequest,
        setSelected: setSelectedRequest,
        toggleRow: handleRowClick,
        selectRow,
    } = useRowSelection("requestId");

    const handleViewRequest = (row) => {
        const targetRequest = row || selectedRequest;
        if (targetRequest) {
            // change it to requestDisplayId eventually for better user exp
            navigate(`/home/requests/${targetRequest.requestId}`);
        }
    };

    const handleSearchChange = (query) => {
        setSearchParams(prev => {
            if (query) prev.set('search', query);
            else prev.delete("search");
            return prev;
        });
        updateFilter('search', query);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in relative font-montserrat">
        <div className="flex justify-between items-end mb-6">

            <div>
                <h1 className="text-3xl font-bold text-foreground mb-1 leading-none tracking-tight">Requests</h1>
                <p className="text-muted-foreground text-sm">View and manage inventory transfer requests</p>
            </div>

                <Button 
                variant="default"
                onClick={() => navigate('/home/requests/create')} 
                >
                    <Plus className="w-4 h-4"/> New Transfer
                </Button>
        </div>

        <div className="w-full justify-between items-center gap-3 mb-2 grid grid-cols-3">

            <Button
                variant={activeTab === "INBOUND" ? "default" : "outline"}
                disabled={user.branchLocation === "WAREHOUSE"}
                onClick={() => handleTabChange("INBOUND")}
            >
                <ArrowDownLeft className="w-4 h-4" />
                    Inbound
            </Button>

            <Button
                variant={activeTab === "OUTBOUND" ? "default" : "outline"}
                onClick={() => handleTabChange("OUTBOUND")}
            >
                <ArrowUpRight className="w-4 h-4" />
                Outbound
            </Button>

            <Button
                variant={activeTab === "" ? "default" : "outline"}
                onClick={() => handleTabChange("")}
                className="flex items-center gap-2"
            >
                <ListFilter className="w-4 h-4" />
                All Requests
            </Button>
        </div>

        <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            filter={filter}
            updateFilter={updateFilter}
            filterOptions={filterOptions}
            className="mb-4"
        />

            {asyncState?.isLoading ? (
                <RequestTableSkeleton rowCount={10} />
            ) : (
                <DataTable 
                    columns={requestColumns}
                    data={requests}
                    keyField="requestId"
                    asyncState={asyncState}
                    pagination={pagination}
                    filter={filter}
                    updateFilter={updateFilter}
                    selectedItem={selectedRequest}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={(row) => {
                        selectRow(row); // was handleRowClick, which deselected an already-selected row
                        handleViewRequest(row);
                    }}
                />
            )}
            
        <div className="flex justify-end mt-4">
            <Button
                variant={selectedRequest ? "default" : "ghost"}
                disabled={!selectedRequest}
                onClick={() => handleViewRequest(selectedRequest)}
                >
                <Eye className="h-8 w-8"/>
                View Request
            </Button>
        </div>
        
        </div>
    );
};

export default RequestPage;