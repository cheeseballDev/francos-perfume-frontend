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

export const verifyLoginOtp = async (email, otp) => {
    const response = await apiClient.post(`${PATH}/OTP`, { email, otp });
    return response.data.data;
}

export const sendForgotPasswordOtp = async (email) => {
    const response = await apiClient.post(`${PATH}/send-forgot-password-otp`, { email });
    return response.data;
}

export const verifyForgotPasswordOtp = async (email, otp) => {
    const response = await apiClient.post(`${PATH}/verify-forgot-password-otp`, { email, otp });
    return response.data.data;
}

export const resetPassword = async (email, resetToken, newPassword) => {
    const response = await apiClient.post(`${PATH}/reset`, { email, resetToken, newPassword });
    return response.data;
}

export const resendOtp = async (email) => {
    const response = await apiClient.post(`${PATH}/resend-otp`, { email });
    return response.data;
}

