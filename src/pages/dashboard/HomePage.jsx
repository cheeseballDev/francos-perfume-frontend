import { useAuth } from "@/auth/UseAuth";
import DashboardSkeleton from "@/components/loaders/DashboardSkeleton";
import StatusCard from "../../components/shared/StatusCard";
import { AlertCircle, Archive, Banknote, BarChart3, Boxes, Clock, Package, ShieldAlert, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// API Services - Adjust uppercase/lowercase here if VS Code still highlights them
import { getAllAuditLogs } from "@/services/AuditLogService"; 
import { getAllDeliveries } from "@/services/DeliveryService";
import { getAllInventory } from "@/services/inventoryService";
import { getLowStockKPI } from "@/services/KPIService";
import { getAllRequests } from "@/services/RequestService";
import { getAllTransactions } from "@/services/TransactionService"; 

// Safe array extractor for varying backend response structures
const getArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.items || res.data || [];
};

// Date Formatter
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// ---------------- UI COMPONENTS ----------------

const DashboardPanel = ({ title, actionText, onAction, children, className = "" }) => (
    <div className={`bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-foreground">{title}</h3>
            {actionText && (
                <button 
                    onClick={onAction}
                    className="text-sm font-bold text-primary hover:underline"
                >
                    {actionText}
                </button>
            )}
        </div>
        <div className="flex-1 flex flex-col gap-3">
            {children}
        </div>
        {actionText && (
            <button 
                onClick={onAction}
                className="w-full mt-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-md transition-colors"
            >
                {actionText}
            </button>
        )}
    </div>
);

const AuditLogItem = ({ log }) => (
    <div className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
        <Archive className="w-5 h-5 text-emerald-500 mt-1" />
        <div>
            <p className="text-sm font-bold text-foreground">{log?.action || "System Action"}</p>
            <p className="text-xs text-muted-foreground">By {log?.performedBy || log?.userName || "System"} • {formatDate(log?.timestamp || log?.createdAt)}</p>
        </div>
    </div>
);

const RequestItem = ({ request }) => (
    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
        <div>
            <p className="text-sm font-bold text-foreground">{request?.requestDisplayId || `REQ-${request?.requestId || '000'}`}</p>
            <p className="text-xs text-muted-foreground">{request?.requestedFrom || "Source"} → {request?.deliveredTo || "Destination"}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-600 rounded-md truncate max-w-[120px] inline-block">
                {request?.requestStatus || "Pending"}
            </span>
            <p className="text-xs font-bold text-muted-foreground mt-1">
                {request?.items?.length || 0} Products
            </p>
        </div>
    </div>
);

const DeliveryItem = ({ delivery }) => (
    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
        <div>
            <p className="text-sm font-bold text-foreground">{delivery?.deliveryDisplayId || `DEL-${delivery?.deliveryId || '000'}`}</p>
            <p className="text-xs text-muted-foreground">{delivery?.fromBranch || "Source"} → {delivery?.toBranch || "Destination"}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-500/20 text-purple-600">
                {delivery?.deliveryStatus || "In Transit"}
            </span>
        </div>
    </div>
);

const LowStockItem = ({ item }) => (
    <div className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg border border-red-100">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
                <p className="text-sm font-bold text-foreground">{item?.productName || "Unknown Product"}</p>
                <p className="text-xs text-muted-foreground">{item?.branchName || "Branch"} - {item?.quantity || 0} units left</p>
                <p className="text-[10px] text-muted-foreground">BATCH: {item?.batchCode || "N/A"} • EXP: {formatDate(item?.expiryDate)}</p>
            </div>
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/20 text-red-600 rounded-sm text-center">Low Stock</span>
        </div>
    </div>
);

const TransactionItem = ({ tx }) => (
    <div className="flex justify-between items-center p-3 border-b border-border last:border-0">
        <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">ID: {tx?.transactionDisplayId || tx?.transactionId}</p>
            <p className="text-sm text-foreground">{tx?.items?.length || 0} items purchased</p>
            <p className="text-xs text-muted-foreground">{formatDate(tx?.transactionDate || tx?.createdAt)}</p>
        </div>
        <span className="text-sm font-bold text-emerald-500">+ ₱{Number(tx?.totalAmount || tx?.grandTotal || 0).toLocaleString()}</span>
    </div>
);

// ---------------- MAIN DASHBOARD ----------------

const DashboardHome = ({ role = "staff", isLoading: externalLoading = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    const userRole = role?.toLowerCase();
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

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsFetching(true);
            try {
                if (userRole === "admin") {
                    const logs = await getAllAuditLogs({ limit: 10 });
                    setData(prev => ({ ...prev, auditLogs: getArray(logs) }));
                } 
                else if (userRole !== "cashier") {
                    const basePromises = [
                        getAllRequests({ status: 'PENDING', branchId }),
                        getAllDeliveries({ status: 'PENDING', branchId }),
                        getAllInventory({ branchId }),
                        getLowStockKPI().catch(() => []) 
                    ];

                    if (userRole === "manager" || userRole === "owner") {
                        basePromises.push(getAllTransactions({ branchId, limit: 10 }));
                    }

                    const results = await Promise.all(basePromises);

                    setData({
                        auditLogs: [],
                        requests: getArray(results[0]),
                        deliveries: getArray(results[1]),
                        inventory: getArray(results[2]),
                        lowStock: getArray(results[3]),
                        transactions: userRole === "manager" || userRole === "owner" ? getArray(results[4]) : []
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

    if (userRole === "cashier") {
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
                    {userRole === "admin" && (
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
                    {userRole !== "admin" && (
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
                    {(userRole === "manager" || userRole === "owner") && (
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
                    {userRole !== "admin" && (
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
                                {(userRole === "manager" || userRole === "owner") && (
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