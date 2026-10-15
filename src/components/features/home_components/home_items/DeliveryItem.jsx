const DeliveryItem = ({ delivery }) => (
    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
        <div>
            <p className="text-sm font-bold text-foreground">{delivery?.deliveryDisplayId || `DEL-${delivery?.deliveryId || '000'}`}</p>
            <p className="text-xs text-muted-foreground">{delivery?.fromBranch || "Source"} → {delivery?.toBranch || "Destination"}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-500/20 text-purple-600">
                {delivery?.deliveryStatus || "In Transit"}
            </span>
        </div>
    </div>
);

export default DeliveryItem;