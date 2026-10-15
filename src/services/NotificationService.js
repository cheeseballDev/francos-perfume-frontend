import apiClient from "./APIClient";

const PATH = "/Notification";

export const getAllNotifications = async () => {
    const response = await apiClient.get(`${PATH}`);
    return response.data;
}

export const patchMarkNotificationAsRead = async (notificationId) => {
    const response = await apiClient.patch(`${PATH}/${notificationId}/read`);
    return response.data;
}

export const patchMarkAsAllRead = async () => {
    const response = await apiClient.patch(`${PATH}/read-all`);
    return response.data;
}