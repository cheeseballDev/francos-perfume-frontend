
export const formatLabel = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

export const cleanFilters = (filters) => {
    const clean = {};
    Object.keys(filters).forEach((key) => {
        const val = filters[key];
        if (val !== null && val !== undefined && val !== "" && !Number.isNaN(val)) {
        clean[key] = val;
        }
    });
    return clean;
};

export const buildFilterOptions = (rawFilters = {}, schema = []) => {
    return schema.map(({ key, label, allLabel }) => {
        const rawItems = rawFilters[key] || [];
        const itemOptions = rawItems.map((item) => ({
        label: formatLabel(String(item)),
        value: item,
        }));

        return {
        key,
        label,
        options: [
            { label: allLabel || `All ${label.replace("Filter: ", "")}s`, value: "" },
            ...itemOptions,
        ],
        };
    });
};

export const formatDateForTable = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDateTimeForTable = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePart = `${year}-${month}-${day}`;

    const timePart = date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return `${datePart}, ${timePart}`;
};
// ₱1,234.50 / -₱250.00 — keeps the sign so refunds or corrections aren't hidden
export const formatPeso = (amount) => {
    const value = Number(amount) || 0;
    const formatted = Math.abs(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${value < 0 ? "-" : ""}₱${formatted}`;
};
