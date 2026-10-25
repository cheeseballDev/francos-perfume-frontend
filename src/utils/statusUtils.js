// One status → colour map for the whole app.
// Tones carry meaning: green = done, blue = moving, amber = waiting / needs attention,
// orange = done but short, red = stopped, grey = closed / informational.

export const TONES = {
    success:  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    progress: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    pending:  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    partial:  "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
    danger:   "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    inbound:  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    outbound: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
    neutral:  "bg-secondary text-secondary-foreground border-border",
};

// Values the backend actually sends (requests, approvals, deliveries, items, accounts, discounts, products)
const EXACT = {
    // finished well
    COMPLETED: "success", COMPLETE: "success", APPROVED: "success", ACCEPTED: "success",
    RECEIVED: "success", DELIVERED: "success", ACTIVE: "success",
    // moving
    "IN TRANSIT": "progress", TRANSIT: "progress", DISPATCHED: "progress", "ASSIGNED TO DELIVERY": "progress",
    // done but short / not final
    PARTIAL: "partial", "PARTIALLY COMPLETED": "partial", "PARTIALLY RECEIVED": "partial",
    "CLOSED PARTIAL": "partial", TEMPORARY: "partial",
    // stopped
    REJECTED: "danger", CANCELLED: "danger", CANCELED: "danger", "DELIVERY CANCELLED": "danger", DEACTIVATED: "danger",
    // closed / informational
    CLOSED: "neutral", FINISHED: "neutral", BYPASSED: "neutral", INACTIVE: "neutral", ARCHIVED: "neutral",
    // approval stages shown in the Stage column (someone still has to act)
    "SOURCE BRANCH MANAGER": "pending", "DESTINATION BRANCH MANAGER": "pending", OWNER: "pending",
    // delivery direction
    INBOUND: "inbound", OUTBOUND: "outbound",
};

export const normalizeStatus = (raw) =>
    (raw ?? "").toString().toUpperCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();

export const statusTone = (raw) => {
    const s = normalizeStatus(raw);
    if (EXACT[s]) return EXACT[s];
    if (s.startsWith("PENDING") || s.endsWith("REVIEW") || s === "CREATED" || s === "FOR DISPATCH") return "pending";
    return "neutral";
};

export const statusClass = (raw) => TONES[statusTone(raw)];

// ── Stock levels ───────────────────────────────────────────────────────────
// Client's definition (interview, Feb 28): 0–20 bottles = low, 25–50 = medium, 50–100 = good.
export const LOW_STOCK_THRESHOLD = 20;

/**
 * @returns {{ level: "out" | "low" | "ok", label: string | null, badgeClass: string | null, textClass: string }}
 */
export const stockLevel = (units) => {
    const qty = Number(units) || 0;

    if (qty <= 0) {
        return { level: "out", label: "Out of stock", badgeClass: TONES.danger, textClass: "text-red-600 dark:text-red-400" };
    }
    if (qty <= LOW_STOCK_THRESHOLD) {
        return { level: "low", label: "Low stock", badgeClass: TONES.pending, textClass: "text-amber-600 dark:text-amber-400" };
    }
    return { level: "ok", label: null, badgeClass: null, textClass: "text-foreground" };
};
