import { normalizeStatus, statusTone, TONES } from '@/utils/statusUtils';
import { Ban, Check, Clock, Minus, Package, PackageCheck, Truck, X } from 'lucide-react';

const TONE_ICONS = {
    success: Check,
    progress: Truck,
    pending: Clock,
    partial: PackageCheck,
    danger: X,
    inbound: Package,
    outbound: Truck,
    neutral: Minus,
};

// Specific icons where the tone's default icon would be misleading
const STATUS_ICONS = {
    DEACTIVATED: Ban,
    RECEIVED: PackageCheck,
    DELIVERED: PackageCheck,
};

export default function StatusBadge({ status, label, className = "" }) {
    const normalized = normalizeStatus(status);
    const tone = statusTone(normalized);
    const Icon = STATUS_ICONS[normalized] || TONE_ICONS[tone];
    const text = (label ?? normalized) || "UNKNOWN";

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-semibold capitalize whitespace-nowrap ${TONES[tone]} ${className}`}
        >
            <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
            {text.toLowerCase()}
        </span>
    );
}
