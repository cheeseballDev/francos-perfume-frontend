
import { useNotifications } from "@/hooks/useNotification";
import { formatDateTimeForTable } from "@/utils/formattingUtils";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";

const NotificationDropdown = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (item) => {
        try {
            if (!item.isRead) {
                await markAsRead(item.notificationId);
            }

            const notificationType = (item.type);
            const referenceId = item.referenceId;

            if (notificationType.includes('DELIVERY')) {
                navigate(referenceId ? `/home/deliveries/${referenceId}` : '/home/deliveries');
            } else if (notificationType.includes('REQUEST')) {
                navigate(referenceId ? `/home/requests/${referenceId}` : '/home/requests');
            } else if (notificationType.includes('INVENTORY') || notificationType.includes('LOW_STOCK')) {
                navigate('/home/inventory');
            } else {
                navigate('/home');
            }

            setIsOpen(false);

        } catch (error) {
            console.error("Error handling notification click:", error);
            toast({
                title: "Notification Error",
                description: "An error occurred while opening the notification details.",
                variant: "destructive",
                duration: 5000
            });  
        }
    }


    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none relative"
                aria-label="Toggle Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl py-3 z-50 text-card-foreground animate-in fade-in zoom-in-95 duration-150">

                    <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-sm">Notifications</h4>
                            {unreadCount > 0 && (
                                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                                title="Mark all as read"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                        {isLoading && notifications.length === 0 ? (
                            <div className="py-8 flex items-center justify-center text-muted-foreground gap-2 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((item) => {
                                const isRead = item.isRead;
                                return (
                                    <div
                                        key={item.notificationId}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`p-3.5 transition-colors flex gap-3 items-start ${
                                            isRead
                                                ? "bg-card hover:bg-muted/40 opacity-70"
                                                : "bg-muted/30 hover:bg-muted/60 cursor-pointer"
                                        }`}
                                    >
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                                                isRead ? "bg-transparent" : "bg-primary"
                                            }`}
                                        />
                                        <div 
                                            className="flex-1 min-w-0 cursor-pointer"
                                            >
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className={`text-xs font-bold truncate ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
                                                    {item.title || "Notification"}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                                    {formatDateTimeForTable(item.createdAt)|| "Just now"}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-2 text-muted-foreground line-clamp-2">
                                                {item.message || "No details provided."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No notifications found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default NotificationDropdown;