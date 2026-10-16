import { useAuth } from "@/auth/UseAuth";
import DashboardPanel from "@/components/features/home_components/DashboardPanel";
import AuditLogItem from "@/components/features/home_components/home_items/AuditLogItem";
import DeliveryItem from "@/components/features/home_components/home_items/DeliveryItem";
import RequestItem from "@/components/features/home_components/home_items/RequestItem";
import TransactionItem from "@/components/features/home_components/home_items/TransactionItem";
import DashboardSkeleton from "@/components/loaders/DashboardSkeleton";
import { useAuditLog } from "@/hooks/audit_hooks/useAuditLog";
import { useKPI } from "@/hooks/kpi_hooks/useKPI";
import { Banknote, BarChart3, Boxes, Clock, Package, Receipt, ShieldAlert } from "lucide-react";
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

    const topCards = [
        { 
            title: "Total Inventory", 
            mainValue: (inventoryStock?.inventoryCount || 0).toLocaleString(), 
            subText: (
                <>
                    <span className="text-destructive font-semibold ">
                        {lowStock?.lowStockProductCount ?? 0} items
                    </span>
                    in low stock.
                </>
            ),
            Icon: Boxes, 
            color: "text-emerald-500" 
        },
        { 
            title: "Total Revenue", 
            mainValue: `₱${((totalRevenue?.totalRevenue || 0) / 1000).toFixed(1)}K`, 
            subText: "Overall", 
            Icon: Banknote, 
            color: "text-emerald-500" 
        },
        { 
            title: "Pending Approvals", 
            mainValue: (pendingApprovals?.pendingApprovalsCount || 0).toString(), 
            subText: "Requests", 
            Icon: Clock, 
            color: "text-blue-500" 
        },
        { 
            title: "Pending Deliveries", 
            mainValue: (upcomingDeliveries?.upcomingDeliveriesCount || 0).toString(), 
            subText: "Deliveries", 
            Icon: Package, 
            color: "text-blue-500" 
        },
        { 
            title: "Total Transactions", 
            mainValue: (totalTransactions?.totalTransactionsCount || 0).toLocaleString(), 
            subText: "Tracked Sales", 
            Icon: Receipt, 
            color: "text-blue-500" 
        }
    ];

    if (userRole === "CASHIER") {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in font-montserrat">
                <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-3xl font-bold text-foreground mb-2">Access Restricted</h1>
                <p className="text-muted-foreground max-w-md">
                    Cashiers do not have permission to view dashboard metrics. Please navigate to the Point of Sale or Transactions list.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in font-montserrat flex flex-col h-full pb-8">
            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-foreground mb-2 leading-none tracking-tight">
                    {userRole === "admin" ? "Admin Dashboard" : "Dashboard"}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {userRole === "admin" ? "System-wide audit trail and management." : "An overview for your branch"}
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
                                />
                            ))}
                        </div>
                    )}

                    {/* MANAGER / OWNER ONLY (Sales Chart) */}
                    {(userRole === "MANAGER" || userRole === "OWNER") && (
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm w-full h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-full flex justify-between items-center mb-6 self-start">
                                <h3 className="font-bold text-foreground text-lg">Sales Forecast and Predictive Analysis</h3>
                                <select className="border border-input rounded-md px-3 py-1 text-sm bg-background">
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                            <BarChart3 className="w-16 h-16 mb-2 opacity-50" />
                            <p>Line Chart Component Placeholder</p>
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
                                    
                                    {(!pendingApprovals?.pendingApprovalsCount === 0) && (
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

                                    {(!upcomingDeliveries?.upcomingDeliveriesCount === 0) && (
                                        <p className="text-sm text-muted-foreground text-center mt-4">No pending deliveries.</p>
                                    )}
                                </DashboardPanel>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-6">

                                {/* Transactions Panel (Manager / Owner Only) */}
                                {(userRole === "MANAGER" || userRole === "OWNER") && (
                                    <DashboardPanel 
                                        title="Recent Transactions" 
                                        actionText="View All Transactions"
                                        onAction={() => navigate('/home/transactions')} 
                                    >
                                        {totalTransactions?.totalTransactionsList?.slice(0, 4).map((transaction, i) => (
                                            <TransactionItem key={transaction.salesOrderId || i} transaction={transaction} />
                                        ))}

                                        {(!totalTransactions?.totalTransactionsCount === 0) && (
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