import { useAuth } from "@/auth/UseAuth";
import DashboardPanel from "@/components/features/home_components/DashboardPanel";
import AuditLogItem from "@/components/features/home_components/home_items/AuditLogItem";
import DeliveryItem from "@/components/features/home_components/home_items/DeliveryItem";
import LowStockItem from "@/components/features/home_components/home_items/LowStockItem";
import RequestItem from "@/components/features/home_components/home_items/RequestItem";
import TransactionItem from "@/components/features/home_components/home_items/TransactionItem";
import DashboardSkeleton from "@/components/loaders/DashboardSkeleton";
import { getAllAuditLogs } from "@/services/AuditLogService";
import { getAllDeliveries } from "@/services/DeliveryService";
import { getAllInventory } from "@/services/InventoryService";
import { getLowStockKPI } from "@/services/KPIService";
import { getAllRequests } from "@/services/RequestService";
import { getAllTransactions } from "@/services/TransactionService";
import { Banknote, BarChart3, Boxes, Clock, Package, Receipt, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusCard from "../../components/shared/StatusCard";

const getArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.items || res.data || [];
};

const DashboardHome = ({ isLoading: externalLoading = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    const userRole = user.trueRole;
    const branchId = user?.branchId;

    const [data, setData] = useState({
        auditLogs: [],
        requests: [],
        deliveries: [],
        lowStock: [],
        transactions: [],
        inventory: []
    });
    
    const [isFetching, setIsFetching] = useState(true);

    // TODO: TO CHANGE INTO PROPER KPIs
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsFetching(true);
            try {
                if (userRole === "ADMIN") {
                    const logs = await getAllAuditLogs({ limit: 10 });
                    setData(prev => ({ ...prev, auditLogs: getArray(logs) }));
                } 
                else if (userRole !== "CASHIER") {
                    const basePromises = [
                        getAllRequests({ status: 'PENDING', branchId }),
                        getAllDeliveries({ status: 'PENDING', branchId }),
                        getAllInventory({ branchId }),
                        getLowStockKPI().catch(() => []) 
                    ];

                    if (userRole === "MANAGER" || userRole === "OWNER") {
                        basePromises.push(getAllTransactions({ branchId, limit: 10 }));
                    }

                    const results = await Promise.all(basePromises);

                    setData({
                        auditLogs: [],
                        requests: getArray(results[0]),
                        deliveries: getArray(results[1]),
                        inventory: getArray(results[2]),
                        lowStock: getArray(results[3]),
                        transactions: userRole === "MANAGER" || userRole === "OWNER" ? getArray(results[4]) : []
                    });
                }
            } catch (error) {
                console.error("Failed to load dashboard metrics:", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (userRole) {
            fetchDashboardData();
        }
    }, [userRole, branchId]);

    const isLoading = externalLoading || isFetching;

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

    const totalInventoryCount = data.inventory.reduce((sum, item) => sum + (Number(item.quantity || item.productQty) || 0), 0);
    const totalRevenue = data.transactions.reduce((sum, tx) => sum + (Number(tx.totalAmount || tx.grandTotal) || 0), 0);
    const totalTransactions = data.transactions.length; 

    const topCards = [
        { title: "Total Inventory", mainValue: totalInventoryCount.toLocaleString(), subText: "Active units", Icon: Boxes, color: "text-emerald-500", secondValue: "" },
        { title: "Total Revenue", mainValue: `₱${(totalRevenue / 1000).toFixed(1)}K`, subText: "Overall", Icon: Banknote, color: "text-emerald-500", secondValue: "" },
        { title: "Pending Approvals", mainValue: data.requests.length.toString(), subText: "Requests", Icon: Clock, color: "text-blue-500", secondValue: "", thirdValue: "", secondSubText: "" },
        { title: "Pending Deliveries", mainValue: data.deliveries.length.toString(), subText: "Deliveries", Icon: Package, color: "text-blue-500", secondValue: "", thirdValue: "", secondSubText: "" },
        { title: "Total Transactions", mainValue: totalTransactions.toLocaleString(), subText: "Tracked Sales", Icon: Receipt, color: "text-blue-500", secondValue: "" }
    ];

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

            {isLoading ? (
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
                                {data.auditLogs.slice(0, 8).map((log, i) => (
                                    <AuditLogItem key={i} log={log} />
                                ))}
                                {data.auditLogs.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">No recent audit logs.</p>}
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
                                    {data.requests.slice(0, 4).map((req, i) => <RequestItem key={i} request={req} />)}
                                    {data.requests.length === 0 && <p className="text-sm text-muted-foreground text-center mt-4">No pending requests.</p>}
                                </DashboardPanel>
                                
                                <DashboardPanel 
                                    title="Pending Deliveries for Dispatch" 
                                    actionText="View All Deliveries"
                                    onAction={() => navigate('/home/deliveries')}
                                >
                                    {data.deliveries.slice(0, 4).map((del, i) => <DeliveryItem key={i} delivery={del} />)}
                                    {data.deliveries.length === 0 && <p className="text-sm text-muted-foreground text-center mt-4">No pending deliveries.</p>}
                                </DashboardPanel>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-6">
                                <DashboardPanel 
                                    title="Low Stock Alerts and About to Expire" 
                                    actionText="View All Inventory"
                                    onAction={() => navigate('/home/inventory')}
                                >
                                    {data.lowStock.slice(0, 4).map((item, i) => <LowStockItem key={i} item={item} />)}
                                    {data.lowStock.length === 0 && <p className="text-sm text-muted-foreground text-center mt-4">Inventory levels are healthy.</p>}
                                </DashboardPanel>

                                {/* Transactions Panel (Manager / Owner Only) */}
                                {(userRole === "MANAGER" || userRole === "OWNER") && (
                                    <DashboardPanel 
                                        title="Recent Transactions" 
                                        actionText="View All Transactions"
                                        onAction={() => navigate('/home/transactions')} 
                                    >
                                        {data.transactions.slice(0, 4).map((tx, i) => <TransactionItem key={i} tx={tx} />)}
                                        {data.transactions.length === 0 && <p className="text-sm text-muted-foreground text-center mt-4">No recent transactions.</p>}
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