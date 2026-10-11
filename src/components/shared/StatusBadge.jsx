import { Check, Clock, Package, PackageCheck, Truck, X } from 'lucide-react';

export default function StatusBadge({ status }) {
    const normalizedStatus = (status || '').toUpperCase().replace(/_/g, ' ');

    // FIXED: Replaced standard grays with semantic defaults
    let config = {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border border-border',
        icon: Clock,
        label: normalizedStatus || 'UNKNOWN'
    };

    switch (normalizedStatus) {
        // ── Request review states ────────────────────────────────────────
        case 'MANAGER REVIEW':
        case 'OTHER MANAGER REVIEW':
        case 'REQUESTING MANAGER REVIEW':
        case 'FULFILLING MANAGER REVIEW':
            config = { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400', border: '', icon: Clock, label: normalizedStatus };
            break;
        case 'OWNER REVIEW':
            config = { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400', border: '', icon: Clock, label: 'OWNER REVIEW' };
            break;

        // ── Generic positive states ──────────────────────────────────────
        case 'APPROVED':
        case 'ACCEPTED':
            config = { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400', border: '', icon: Check, label: normalizedStatus };
            break;

        // ── Generic negative states ──────────────────────────────────────
        case 'REJECTED':
        case 'CANCELLED':
        case 'CANCELED':
            config = { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', border: '', icon: X, label: normalizedStatus };
            break;

        // ── Delivery states ──────────────────────────────────────────────
        case 'COMPLETED':
            config = { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400', border: '', icon: Check, label: 'COMPLETED' };
            break;
        case 'PARTIALLY COMPLETED':
        case 'PARTIAL':
        case 'PARTIALLY RECEIVED':
            config = { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', border: '', icon: PackageCheck, label: 'PARTIALLY COMPLETED' };
            break;
        case 'IN TRANSIT':
        case 'DISPATCHED':
            config = { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-400', border: '', icon: Truck, label: 'IN TRANSIT' };
            break;
        case 'FOR DISPATCH':
        case 'PENDING':
        case 'CREATED':
            // FIXED: Used semantic variables for the neutral state
            config = { bg: 'bg-card dark:bg-muted/50', text: 'text-foreground', border: 'border border-border shadow-sm', icon: Clock, label: normalizedStatus };
            break;
        case 'RECEIVED':
        case 'DELIVERED':
            config = { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', border: '', icon: PackageCheck, label: normalizedStatus };
            break;

        // ── Direction (used by StatusBadge in DeliveryCard header) ───────
        case 'INBOUND':
            config = { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', border: '', icon: Package, label: 'INBOUND' };
            break;
        case 'OUTBOUND':
            config = { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400', border: '', icon: Truck, label: 'OUTBOUND' };
            break;

        default:
            config = { bg: 'bg-secondary dark:bg-secondary/50', text: 'text-secondary-foreground', border: 'border border-border', icon: Clock, label: normalizedStatus };
            break;
    }

    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold capitalize ${config.bg} ${config.text} ${config.border}`}>
            {/* FIXED: Replaced fill-gray-700 with fill-current so it inherits text-foreground dynamically */}
            <IconComponent size={14} strokeWidth={2.5} className={normalizedStatus === 'FOR DISPATCH' ? 'fill-current' : ''} />
            {config.label.toLowerCase()}
        </span>
    );
}