import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERIOD_OPTIONS, formatPeriodRange } from "@/utils/periodUtils";
import { CalendarDays } from "lucide-react";

const PeriodSelect = ({ value, onChange, showRange = false, className = "", disabled = false }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        {showRange && (
            <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">{formatPeriodRange(value)}</span>
        )}
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger aria-label="Time period" className="w-40 bg-background">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
                {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

export default PeriodSelect;
