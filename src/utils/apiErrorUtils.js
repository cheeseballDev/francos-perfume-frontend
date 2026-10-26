export const getAPIError = (error, fallback = "Something went wrong. Please try again.") => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    return data?.message || fallback;
}