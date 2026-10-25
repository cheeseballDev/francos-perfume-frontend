import StatusBadge from "@/components/shared/StatusBadge";

const DeliveryItem = ({ delivery }) => (
    <div className="flex justify-between items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
        <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">{delivery?.deliveryDisplayId}</p>
            <p className="text-xs text-muted-foreground truncate">{delivery?.fromBranch} → {delivery?.toBranch}</p>
        </div>
        <StatusBadge status={delivery?.deliveryStatus || "PENDING DISPATCH"} />
    </div>
);

export default DeliveryItem;
