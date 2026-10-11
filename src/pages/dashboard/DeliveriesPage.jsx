import { useAuth } from "@/auth/UseAuth";
import DeliveryCard from "@/components/features/delivery_components/DeliveryCard";
import DeliverySkeletonList from "@/components/loaders/DeliverySkeletonList";
import { FilterDropDown } from "@/components/shared";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PaginationBar from "@/components/shared/PaginationBar";
import SearchBar from "@/components/shared/SearchBar";
import StatusCard from "@/components/shared/StatusCard";
import { Button } from "@/components/ui/button";
import { useDelivery } from "@/hooks/delivery_hooks/useDelivery";
import { cancelDelivery, dispatchDelivery, receiveDelivery } from "@/services/DeliveryService";
import { ArrowDownLeft, ArrowUpRight, Clock, ListFilter } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DeliveriesPage = () => {
    const {
        deliveries,
        asyncState,
        pagination,
        filter,
        updateFilter,
        filterOptions,
        fetchDeliveries,
    } = useDelivery();

    const { user } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();
    const [config, setConfig] = useState(null);

    // Extract active tab and search query directly from URL state
    const activeTab = searchParams.get("direction") || "";
    const searchQuery = searchParams.get("search") || "";

    // Sync URL parameters with the backend filter hook
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

    const handleSearchChange = (value) => {
        const query = value?.target ? value.target.value : value;
        setSearchParams(prev => {
            if (query) prev.set("search", query);
            else prev.delete("search");
            return prev;
        });
        updateFilter("search", query);
    };

    const handleMarkInTransit = (deliveryId) => {
        setConfig({
            title: "Mark as In Transit?",
            description: "This will notify the receiving branch that the delivery is on its way.",
            confirmText: "Mark In Transit",
            onConfirm: async () => {
                try {
                    await dispatchDelivery(deliveryId);
                    fetchDeliveries();
                    setConfig(null);
                } catch (err) {
                    console.error("Failed to mark as in transit:", err);
                    setConfig({
                        isAlert: true,
                        title: "Action Failed",
                        description: err.message || "Failed to mark as in transit.",
                        confirmVariant: "destructive",
                        confirmText: "Acknowledge",
                        onConfirm: () => setConfig(null) 
                    });
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleCancelRequest = (deliveryId) => {
        setConfig({
            title: "Cancel this request?",
            description: "This cannot be undone. The request will be terminated.",
            confirmText: "Cancel Request",
            onConfirm: async () => {
                try {
                    await cancelDelivery(deliveryId);
                    fetchDeliveries();
                    setConfig(null);
                } catch (err) {
                    console.error("Failed to cancel delivery:", err);
                    setConfig({
                        isAlert: true,
                        title: "Action Failed",
                        description: err.message || "Failed to cancel the delivery request.",
                        confirmVariant: "destructive",
                        confirmText: "Acknowledge",
                        onConfirm: () => setConfig(null) 
                    });
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleAcceptRequest = (deliveryId) => {
        setConfig({
            title: "Accept this delivery request?",
            description: "You are confirming that you accept this inbound delivery.",
            confirmText: "Accept Request",
            onConfirm: async () => {
                try {
                    await receiveDelivery(deliveryId, { accepted: true });
                    fetchDeliveries();
                    setConfig(null);
                } catch (err) {
                    console.error("Failed to accept delivery:", err);
                    setConfig({
                        isAlert: true,
                        title: "Action Failed",
                        description: err.message || "Failed to accept the delivery request.",
                        confirmVariant: "destructive",
                        confirmText: "Acknowledge",
                        onConfirm: () => setConfig(null) 
                    });
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleRejectRequest = (deliveryId) => {
        setConfig({
            title: "Reject this delivery request?",
            description: "This will notify the source branch that the request has been rejected.",
            confirmText: "Reject Request",
            onConfirm: async () => {
                try {
                    await receiveDelivery(deliveryId, { accepted: false });
                    fetchDeliveries();
                    setConfig(null);
                } catch (err) {
                    console.error("Failed to reject delivery:", err);
                    setConfig({
                        isAlert: true,
                        title: "Action Failed",
                        description: err.message || "Failed to reject the delivery request.",
                        confirmVariant: "destructive",
                        confirmText: "Acknowledge",
                        onConfirm: () => setConfig(null) 
                    });
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    const handleConfirmDelivery = (deliveryId) => {
        setConfig({
            title: "Confirm delivery received?",
            description: "This will mark the delivery as completed and update your inventory.",
            confirmText: "Confirm Delivery",
            onConfirm: async () => {
                try {
                    await receiveDelivery(deliveryId, { received: true });
                    fetchDeliveries();
                    setConfig(null);
                } catch (err) {
                    console.error("Failed to confirm delivery:", err);
                    setConfig({
                        isAlert: true,
                        title: "Action Failed",
                        description: err.message || "Failed to confirm the delivery.",
                        confirmVariant: "destructive",
                        confirmText: "Acknowledge",
                        onConfirm: () => setConfig(null) 
                    });
                }
            },
            onCancel: () => setConfig(null),
        });
    };

    return (
        <div className="flex flex-col h-full animate-fade-in font-montserrat overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
                    Deliveries
                </h1>
                <p className="text-muted-foreground text-sm">Manage transfer deliveries</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatusCard
                    title="Pending Dispatches"
                    Icon={Clock}
                    //secondValue={forDispatchInbound}
                    subText=" inbound, "
                    //thirdValue={forDispatchOutbound}
                    secondSubText=" outbound"
                />
                <StatusCard
                    title="Outbound Deliveries"
                    Icon={Clock}
                    //secondValue={outboundInTransit}
                    subText=" in-transit "
                    //thirdValue={outboundCompleted}
                    secondSubText=" completed"
                />
                <StatusCard
                    title="Inbound Deliveries"
                    Icon={Clock}
                    //secondValue={inboundInTransit}
                    subText=" in-transit "
                    //thirdValue={inboundCompleted}
                    secondSubText=" completed"
                />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
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
                    All Deliveries
                </Button>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:max-w-xl">
                        <SearchBar
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <FilterDropDown
                        filter={filter}
                        updateFilter={updateFilter}
                        filterOptions={filterOptions}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {asyncState.isLoading ? (
                    <DeliverySkeletonList rowCount={4} />
                ) : deliveries.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        No deliveries found.
                    </div>
                ) : (
                    deliveries.map(delivery => (
                        <DeliveryCard
                            key={delivery.deliveryId}
                            delivery={delivery}
                            activeTab={activeTab}
                            onMarkInTransit={handleMarkInTransit}
                            onCancelRequest={handleCancelRequest}
                            onAcceptRequest={handleAcceptRequest}
                            onRejectRequest={handleRejectRequest}
                            onConfirmDelivery={handleConfirmDelivery}
                        />
                    ))
                )}
            </div>

            <PaginationBar
                pageCount={filter.pageCount}
                pageSize={filter.pageSize}
                totalPages={pagination.totalPages}
                totalEntries={pagination.totalEntries}
                updateFilter={updateFilter}
            />

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                config={config}
            />
        </div>
    );
};

export default DeliveriesPage;