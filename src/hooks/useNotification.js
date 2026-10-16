
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/SupabaseClient";
import { getAllNotifications, patchMarkAsAllRead, patchMarkNotificationAsRead } from "@/services/NotificationService";

import { useCallback, useEffect, useState } from "react";

export const useNotifications = () => {
    const { toast } = useToast();

    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getAllNotifications();

            const notificationList = Array.isArray(data) 
                ? data 
                : data?.notifications || data?.items || [];

            setNotifications(notificationList);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        const userData = JSON.parse(localStorage.getItem("user"));
        const employeeId = userData.employeeId;

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const newRow = payload.new;

                    // Ensure the notification belongs to the logged-in employee 
                    // (Note: Database column name is usually employee_id)
                    if (employeeId && Number(newRow.employee_id) === Number(employeeId)) {
                        
                        // Map database snake_case to match your frontend component keys if needed
                        const formattedNotification = {
                            notificationId: newRow.notification_id || newRow.id,
                            title: newRow.title,
                            message: newRow.message,
                            type: newRow.type,
                            referenceId: newRow.reference_id,
                            isRead: newRow.is_read || false,
                            createdAt: newRow.created_at || new Date().toISOString()
                        };

                        setNotifications((prev) => [formattedNotification, ...prev]);
                        setUnreadCount((prev) => prev + 1);

                        // Optional: trigger a subtle toast pop-up when a new notification arrives in real-time
                        toast({
                            title: formattedNotification.title || "New Notification",
                            description: formattedNotification.message,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchNotifications, toast]);

    const markAsRead = async (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
        );

        try {
            await patchMarkNotificationAsRead(id);
        } catch (error) {
            fetchNotifications();
            toast({
                title: "Error",
                description: `Failed to mark notification as read.\n${error}`,
                variant: "destructive",
            });
        }
    };

    const markAllAsRead = async () => {
        const previousState = [...notifications];
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        try {
            await patchMarkAsAllRead();
        } catch (error) {
            setNotifications(previousState);
            toast({
                title: "Error",
                description: `Failed to mark all notifications as read.\n${error}`,
                variant: "destructive",
            });
        }
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
};