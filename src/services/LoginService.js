import apiClient from "./APIClient";

const PATH = "/auth";

export const login = async (email, password, newPassword = null) => {
    const response = await apiClient.post(`${PATH}/login`, { 
        email, 
        password, 
        newPassword 
    });
    console.log(response.data.data);
    return response.data.data;
};
