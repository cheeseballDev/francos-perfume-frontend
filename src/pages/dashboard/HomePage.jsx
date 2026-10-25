import { useAuth } from "@/auth/UseAuth";
import DashboardPanel from "@/components/features/home_components/DashboardPanel";
import AuditLogItem from "@/components/features/home_components/home_items/AuditLogItem";
import DeliveryItem from "@/components/features/home_components/home_items/DeliveryItem";
import RequestItem from "@/components/features/home_components/home_items/RequestItem";
import TransactionItem from "@/components/features/home_components/home_items/TransactionItem";
import DashboardSkeleton from "@/components/loaders/DashboardSkeleton";
import { useAuditLog } from "@/hooks/audit_hooks/useAuditLog";
import { useKPI } from "@/hooks/kpi_hooks/useKPI";
import { formatPeso } from "@/utils/formattingUtils";
import { TONES } from "@/utils/statusUtils";
import { Banknote, Boxes, Clock, Package, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusCard from "../../components/shared/StatusCard";

const DashboardHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    const userRole = user.trueRole;

    const {
        lowStock,
        inventoryStock,
        pendingApprovals,
        upcomingDeliveries,
        totalRevenue,
        totalTransactions,
        asyncState
    } = useKPI();

    const {
        auditLogs
    } = useAuditLog();

    // Short form for the card (₱1.2M / ₱45.3K); the exact amount goes underneath via formatPeso
    const formatRevenue = (amount) => {
        const value = Number(amount) || 0;
        if (Math.abs(value) >= 1000000) return `${value < 0 ? "-" : ""}₱${(Math.abs(value) / 1000000).toFixed(1)}M`;
        if (Math.abs(value) >= 1000) return `${value < 0 ? "-" : ""}₱${(Math.abs(value) / 1000).toFixed(1)}K`;
        return formatPeso(value);
    };

    const lowStockCount = lowStock?.lowStockProductCount ?? 0;
    const revenue = Number(totalRevenue?.totalRevenue) || 0;

    const topCards = [
        { 
            title: "Total Inventory", 
            mainValue: (inventoryStock?.inventoryCount || 0).toLocaleString(), 
            subText: lowStockCount > 0 ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${TONES.pending}`}>
                    {lowStockCount} {lowStockCount === 1 ? "item" : "items"} in low stock
                </span>
            ) : (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${TONES.success}`}>
                    All items in stock
                </span>
            ),
            Icon: Boxes, 
            color: "text-emerald-500",
            route: "/home/inventory" 
        },
        { 
            title: "Total Revenue", 
            mainValue: formatRevenue(revenue),
            subText: `${formatPeso(revenue)} overall`, 
            Icon: Banknote, 
            color: "text-emerald-500",
            route: "/home/transactions" 
        },
        { 
            title: "Pending Approvals", 
            mainValue: (pendingApprovals?.pendingApprovalsCount || 0).toString(), 
            subText: "Requests", 
            Icon: Clock, 
            color: "text-blue-500",
            route: "/home/requests" 
        },
        { 
            title: "Pending Deliveries", 
            mainValue: (upcomingDeliveries?.upcomingDeliveriesCount || 0).toString(), 
            subText: "Deliveries", 
            Icon: Package, 
            color: "text-blue-500",
            route: "/home/deliveries" 
        },
        { 
            title: "Total Transactions", 
            mainValue: (totalTransactions?.totalTransactionsCount || 0).toLocaleString(), 
            subText: "Tracked Sales", 
            Icon: Receipt, 
            color: "text-blue-500",
            route: "/home/transactions" 
        }
    ].filter(card => {
        if (userRole === "STAFF" || userRole === "ADMIN") {
            return card.title !== "Total Revenue" && card.title !== "Total Transactions";
        }
        return true;
    });

    return (
        <div className="animate-fade-in font-montserrat flex flex-col h-full pb-8">
            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-foreground mb-2 leading-none tracking-tight">
                    {userRole === "ADMIN" ? "Admin Dashboard" : "Dashboard"}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {userRole === "ADMIN" ? "System-wide audit trail and management." : "An overview for your branch"}
                </p>
            </header>

            {asyncState.isLoading ? (
                <DashboardSkeleton cardCount={5} />
            ) : (
                <div className="flex flex-col gap-6">
                    
                    {/* ADMIN VIEW */}
                    {userRole === "ADMIN" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <DashboardPanel
                                title="Recent Audit Logs" 
                                actionText="View All" 
                                onAction={() => navigate('/home/audit-log')}
                                className="min-h-[500px]"
                            >
                                <p className="text-sm text-muted-foreground mb-4">All latest actions done by any user.</p>
                                {auditLogs.slice(0, 8).map((log, i) => (
                                    <AuditLogItem key={i} log={log} />
                                ))}
                                {auditLogs.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">No recent audit logs.</p>}
                            </DashboardPanel>
                        </div>
                    )}

                    {/* STAFF / MANAGER / OWNER VIEW (Shared Top Cards) */}
                    {userRole !== "ADMIN" && (
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                            {topCards.map((card, index) => (
                                <StatusCard 
                                    key={index}
                                    title={card.title}
                                    mainValue={card.mainValue}
                                    subText={card.subText}
                                    Icon={card.Icon}
                                    color={card.color}
                                    onClick={() => navigate(card.route)} 
                                />
                            ))}
                        </div>
                    )}

                    {/* BOTTOM GRIDS (Staff, Manager, Owner) */}
                    {userRole !== "ADMIN" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Left Column */}
                            <div className="flex flex-col gap-6">
                                <DashboardPanel 
                                    title="Pending Requests for Approval" 
                                    actionText="View All Requests"
                                    onAction={() => navigate('/home/requests')}
                                >
                                    {pendingApprovals?.pendingApprovalsList?.slice(0, 4).map((request, i) => (
                                        <RequestItem key={request.approvalId || i} request={request} />
                                    ))}
                                    
                                    {(pendingApprovals?.pendingApprovalsCount ?? 0) === 0 && (
                                        <p className="text-sm text-muted-foreground text-center mt-4">No pending requests.</p>
                                    )}
                                </DashboardPanel>
                                
                                <DashboardPanel 
                                    title="Pending Deliveries for Dispatch" 
                                    actionText="View All Deliveries"
                                    onAction={() => navigate('/home/deliveries')}
                                >
                                    {upcomingDeliveries?.upcomingDeliveriesList?.slice(0, 4).map((delivery, i) => (
                                        <DeliveryItem key={delivery.deliveryId || i} delivery={delivery} />
                                    ))}

                                    {(upcomingDeliveries?.upcomingDeliveriesCount ?? 0) === 0 && (
                                        <p className="text-sm text-muted-foreground text-center mt-4">No pending deliveries.</p>
                                    )}
                                </DashboardPanel>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-6">

                                {/* Transactions Panel (Manager / Owner Only) */}
                                {(userRole === "MANAGER" || userRole === "OWNER") && (
                                    <DashboardPanel 
                                        title="Recent Transactions (Last 30 days)" 
                                        actionText="View All Transactions"
                                        onAction={() => navigate('/home/transactions')} 
                                    >
                                        {totalTransactions?.recentTransactionsList?.slice(0, 10).map((transaction, i) => (
                                            <TransactionItem key={transaction.salesOrderId || i} transaction={transaction} />
                                        ))}

                                        {(totalTransactions?.totalTransactionsCount ?? 0) === 0 && (
                                            <p className="text-sm text-muted-foreground text-center mt-4">No recent transactions.</p>
                                        )}
                                    </DashboardPanel>
                                )}
                            </div>
                            
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardHome;