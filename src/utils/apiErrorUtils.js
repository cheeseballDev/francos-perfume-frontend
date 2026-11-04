export const getAPIError = (error, fallback = "Something went wrong. Please try again.") => {
    if (!error?.response) {
        if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
            return "Cannot reach the server. Check your internet connection and try again.";
        }
        return fallback;
    }
    const data = error.response.data;
    if (typeof data === "string" && data.trim()) return data;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (typeof data?.title === "string" && data.title.trim()) return data.title;
    return fallback;
};
