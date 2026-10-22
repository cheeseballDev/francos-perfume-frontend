
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/SupabaseClient";
import { getAllNotifications, patchMarkAsAllRead, patchMarkNotificationAsRead } from "@/services/NotificationService";
import { formatDateTimeForTable } from "@/utils/formattingUtils";

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
                : data?.notifications;

            setNotifications(notificationList);
            const unread = notificationList.filter(n => !n.isRead).length;
            setUnreadCount(unread);
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

                    if (employeeId && (newRow.employee_id === employeeId)) {
                        
                        const formattedNotification = {
                            notificationId: newRow.notification_id,
                            title: newRow.title,
                            message: newRow.message,
                            type: newRow.type,
                            referenceId: newRow.reference_id,
                            isRead: newRow.is_read,
                            createdAt: formatDateTimeForTable(newRow.created_at)
                        };

                       setNotifications((prev) => {
                            const updated = [formattedNotification, ...prev];
                            const unread = updated.filter(n => !n.isRead).length;
                            setUnreadCount(unread);
                            return updated;
                        });

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
        setUnreadCount((prev) => Math.max(0, prev - 1))

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
        const previousCount = unreadCount;

        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await patchMarkAsAllRead();
        } catch (error) {
            setNotifications(previousState);
            setUnreadCount(previousCount);
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