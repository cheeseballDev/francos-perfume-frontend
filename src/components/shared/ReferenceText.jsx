import { useAuth } from "@/auth/UseAuth";
import { useNavigate } from "react-router-dom";

const REFERENCE_ROUTES = {
    REQ: "/home/requests",
    DEL: "/home/deliveries",
    PROD: "/home/inventory",
    EMP: "/home/accounts",
};

const ROUTE_ROLES = {
    "/home/requests": ["MANAGER", "OWNER", "STAFF"],
    "/home/deliveries": ["MANAGER", "OWNER", "STAFF"],
    "/home/inventory": ["MANAGER", "OWNER", "STAFF"],
    "/home/products": ["OWNER"],
    "/home/accounts": ["MANAGER", "OWNER", "ADMIN"],
    "/home/archives": ["MANAGER", "OWNER", "ADMIN"],
};

const REFERENCE_PATTERN = new RegExp(`\\b(${Object.keys(REFERENCE_ROUTES).join("|")})-\\d+\\b`, "g");

export const referenceRoute = (reference, context = "") => {
    const prefix = String(reference || "").split("-")[0];
    if (!REFERENCE_ROUTES[prefix]) return null;

    if (/\barchived\b/i.test(context) && (prefix === "PROD" || prefix === "EMP")) {
        return "/home/archives";
    }

    const base = /\brestored\b/i.test(context) && prefix === "PROD"
        ? "/home/products"
        : REFERENCE_ROUTES[prefix];

    return `${base}?search=${encodeURIComponent(reference)}`;
};

export const canOpenRoute = (route, role) => {
    if (!route) return false;
    const path = route.split("?")[0];
    const allowed = ROUTE_ROLES[path];
    return !allowed || allowed.includes(String(role || "").toUpperCase());
};

export const ReferenceLink = ({ reference, context = "", className = "" }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const route = referenceRoute(reference, context);

    if (!reference || reference === "N/A" || !canOpenRoute(route, user?.trueRole)) {
        return <span className={className}>{reference || "N/A"}</span>;
    }

    return (
        <button
            type="button"
            onClick={(event) => {
                event.stopPropagation();
                navigate(route);
            }}
            onDoubleClick={(event) => event.stopPropagation()}
            className={`font-semibold text-primary-foreground dark:text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid ${className}`}
            title={`Open ${reference}`}
        >
            {reference}
        </button>
    );
};

const ReferenceText = ({ text, className = "" }) => {
    if (!text) return null;
    const parts = [];
    let lastIndex = 0;
    String(text).replace(REFERENCE_PATTERN, (match, _prefix, offset) => {
        if (offset > lastIndex) parts.push(String(text).slice(lastIndex, offset));
        parts.push(<ReferenceLink key={`${match}-${offset}`} reference={match} context={String(text)} />);
        lastIndex = offset + match.length;
        return match;
    });
    if (lastIndex < String(text).length) parts.push(String(text).slice(lastIndex));
    return <span className={className}>{parts}</span>;
};

export default ReferenceText;
