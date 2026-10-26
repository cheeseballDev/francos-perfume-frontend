// Who can open which module, in one place.
//
// A user has ONE account role (user.trueRole) and picks a module to work in
// (user.activeModule). Permissions always come from the account role, so switching
// modules never changes what someone is allowed to do.
//
// The CASHIER role was removed: POS is now used by the roles in POS_ROLES.

export const MODULES = Object.freeze({
    DASHBOARD: "DASHBOARD",
    POS: "POS",
});

export const POS_ROLES = ["MANAGER", "STAFF"];
export const DASHBOARD_ROLES = ["OWNER", "ADMIN", "MANAGER", "STAFF"];

export const canUsePos = (role) => POS_ROLES.includes(role);
export const canUseDashboard = (role) => DASHBOARD_ROLES.includes(role);

/** False for roles with no module, e.g. a leftover CASHIER account. */
export const hasAnyAccess = (role) => canUsePos(role) || canUseDashboard(role);

/** Users who can use both modules get the module picker and "Switch Module". */
export const canSwitchModule = (role) => canUsePos(role) && canUseDashboard(role);

/** Module a role lands in when it has no choice to make. */
export const defaultModuleFor = (role) =>
    canUseDashboard(role) ? MODULES.DASHBOARD : MODULES.POS;

export const isPosModule = (user) => user?.activeModule === MODULES.POS;

/** "/pos" or "/home", plus an optional sub-path such as "settings". */
export const modulePath = (user, subPath = "") => {
    const base = isPosModule(user) ? "/pos" : "/home";
    return subPath ? `${base}/${subPath}` : base;
};

/**
 * Brings a stored user up to date. Sessions saved before this change kept the module
 * in activeRole ("CASHIER" meant POS, and a STAFF who pressed Switch Module became "MANAGER").
 */
export const normalizeUser = (user) => {
    if (!user) return user;
    const trueRole = user.trueRole || user.activeRole || user.role;

    let activeModule = user.activeModule;
    if (!activeModule) {
        activeModule = user.activeRole === "CASHIER" ? MODULES.POS : defaultModuleFor(trueRole);
    }
    if (activeModule === MODULES.POS && !canUsePos(trueRole)) activeModule = MODULES.DASHBOARD;
    if (activeModule === MODULES.DASHBOARD && !canUseDashboard(trueRole)) activeModule = MODULES.POS;

    // activeRole is kept (same as trueRole) for any code that still reads it
    return { ...user, trueRole, activeRole: trueRole, activeModule };
};
