import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = String(email).split("@");
    if (!domain) return "•".repeat(Math.min(String(email).length, 8));
    const visible = name.slice(0, 1);
    return `${visible}${"•".repeat(Math.max(name.length - 1, 3))}@${domain}`;
};

const SensitiveText = ({ value, mask = maskEmail, label = "email", className = "", emptyText = "N/A" }) => {
    const [isVisible, setIsVisible] = useState(false);

    if (!value) return <span className={className}>{emptyText}</span>;

    const toggle = (event) => {
        event.stopPropagation();
        setIsVisible((prev) => !prev);
    };

    return (
        <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
            <span className="truncate" title={isVisible ? value : undefined}>
                {isVisible ? value : mask(value)}
            </span>
            <button
                type="button"
                onClick={toggle}
                onDoubleClick={(event) => event.stopPropagation()}
                aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
                aria-pressed={isVisible}
                className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </span>
    );
};

export default SensitiveText;
