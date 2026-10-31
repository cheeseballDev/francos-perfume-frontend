
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

// ---------------------------------------------------------------------------
// Dates and times: always shown in Philippine time, whatever the device is set to.
//
// The backend stores UTC. Some API values arrive without a "Z" (e.g. "2026-10-31T03:35:00"),
// and JavaScript reads those as the DEVICE's local time, which put them 8 hours off.
// Every date from the API goes through parseApiDate before it is shown.
// ---------------------------------------------------------------------------
export const APP_TIME_ZONE = "Asia/Manila";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const HAS_TIME = /T\d{2}:\d{2}/;
const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/i;

/** API value (string or Date) → Date, or null if empty/invalid. */
export const parseApiDate = (value) => {
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (value === null || value === undefined || value === "") return null;

    let text = String(value).trim();
    if (DATE_ONLY.test(text)) {
        // A calendar day (e.g. an expiry date) means that day in the Philippines
        text = `${text}T00:00:00+08:00`;
    } else if (HAS_TIME.test(text)) {
        text = text.replace(/(\.\d{3})\d+/, "$1"); // .NET sends 7 decimal places; keep 3
        if (!HAS_OFFSET.test(text)) text = `${text}Z`; // no offset = UTC from the backend
    }

    const date = new Date(text);
    return isNaN(date.getTime()) ? null : date;
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
}); // en-CA gives yyyy-MM-dd

const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: true,
});

const receiptFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE, month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
});

const clockFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE, weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
});

// ---- Sending dates: the backend accepts UTC only ----------------------------------
// A date picked in a date input ("2026-10-31") means that day in the Philippines.
// Start of that day = 2026-10-30T16:00:00.000Z, end = 2026-10-31T15:59:59.999Z.
export const manilaDayStartUtc = (yyyyMMdd) => new Date(`${yyyyMMdd}T00:00:00.000+08:00`).toISOString();
export const manilaDayEndUtc = (yyyyMMdd) => new Date(`${yyyyMMdd}T23:59:59.999+08:00`).toISOString();

// Keys whose picked date means "up to the end of that day"
const END_OF_DAY_KEYS = new Set(["toDate", "dateTo", "endDate"]);

/**
 * Turns every plain "yyyy-MM-dd" value under a key ending in "Date"/"date" (fromDate, toDate,
 * dateFrom, dateTo, expiryDate, ...) into a UTC ISO string. Other values are left alone.
 * Works on objects, arrays and URLSearchParams. Used by APIClient for params and bodies.
 */
export const toUtcDateValues = (value, key = "") => {
    if (typeof value === "string") {
        if (!DATE_ONLY.test(value) || !/date/i.test(key)) return value;
        return END_OF_DAY_KEYS.has(key) ? manilaDayEndUtc(value) : manilaDayStartUtc(value);
    }
    if (value instanceof URLSearchParams) {
        const next = new URLSearchParams();
        value.forEach((v, k) => next.append(k, toUtcDateValues(v, k)));
        return next;
    }
    if (Array.isArray(value)) return value.map((item) => toUtcDateValues(item, key));
    if (value && typeof value === "object" && !(value instanceof Date) && !(value instanceof Blob) && !(value instanceof FormData)) {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toUtcDateValues(v, k)]));
    }
    return value;
};

/** 2026-10-31 */
export const formatDateForTable = (value) => {
    const date = parseApiDate(value);
    return date ? dateFormatter.format(date) : "N/A";
};

/** 2026-10-31 for <input type="date"> ("" when empty) */
export const formatDateForInput = (value) => {
    const date = parseApiDate(value);
    return date ? dateFormatter.format(date) : "";
};

/** 2026-10-31, 07:35 PM */
export const formatDateTimeForTable = (value) => {
    const date = parseApiDate(value);
    return date ? `${dateFormatter.format(date)}, ${timeFormatter.format(date)}` : "N/A";
};

/** Oct 31, 2026, 7:35:12 PM (receipts) */
export const formatReceiptDateTime = (value) => {
    const date = parseApiDate(value);
    return date ? receiptFormatter.format(date) : "N/A";
};

/** Sat, Oct 31, 07:35:12 PM (live clock) */
export const formatClock = (value = new Date()) => clockFormatter.format(value);

/** Today's date in the Philippines as yyyy-MM-dd (e.g. a date input's min) */
export const todayInManila = () => dateFormatter.format(new Date());

// ₱1,234.50 / -₱250.00 — keeps the sign so refunds or corrections aren't hidden
export const formatPeso = (amount) => {
    const value = Number(amount) || 0;
    const formatted = Math.abs(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${value < 0 ? "-" : ""}₱${formatted}`;
};
