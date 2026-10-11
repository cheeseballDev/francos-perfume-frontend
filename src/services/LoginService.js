import apiClient from "./ApiClient";

const PATH = "/auth";

export const login = async (email, password, newPassword = null) => {
  const response = await apiClient.post(`${PATH}/login`, { 
    email, 
    password, 
    newPassword 
  });
  return response.data;
};