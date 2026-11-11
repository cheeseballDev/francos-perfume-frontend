import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { todayInManila } from "@/utils/formattingUtils";
import {
    PERIODS,
    PERIOD_OPTIONS,
    formatPeriodRange,
    getPeriodRange,
    getSelectValue,
    isCustomPeriod,
    toCustomPeriod,
} from "@/utils/periodUtils";
import { CalendarDays } from "lucide-react";

const dateInputClass =
    "h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50";

const PeriodSelect = ({ value, onChange, showRange = false, className = "", disabled = false }) => {
    const isCustom = isCustomPeriod(value);
    const today = todayInManila();
    const { fromDate, toDate } = getPeriodRange(value);

    const handleSelect = (next) => {
        if (next === PERIODS.CUSTOM) {
            onChange(toCustomPeriod(fromDate, toDate));
            return;
        }
        onChange(next);
    };

    const handleDateChange = (key) => (event) => {
        const picked = event.target.value;
        if (!picked) return;

        let nextFrom = fromDate;
        let nextTo = toDate;

        if (key === "from") {
            nextFrom = picked > today ? today : picked;
            if (nextFrom > nextTo) nextTo = nextFrom;
        } else {
            nextTo = picked > today ? today : picked;
            if (nextTo < nextFrom) nextFrom = nextTo;
        }

        onChange(toCustomPeriod(nextFrom, nextTo));
    };

    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
            {showRange && !isCustom && (
                <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">{formatPeriodRange(value)}</span>
            )}

            {isCustom && (
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        From
                        <input
                            type="date"
                            aria-label="Date from"
                            value={fromDate}
                            max={toDate}
                            onChange={handleDateChange("from")}
                            disabled={disabled}
                            className={dateInputClass}
                        />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        To
                        <input
                            type="date"
                            aria-label="Date to"
                            value={toDate}
                            min={fromDate}
                            max={today}
                            onChange={handleDateChange("to")}
                            disabled={disabled}
                            className={dateInputClass}
                        />
                    </label>
                </div>
            )}

            <Select value={getSelectValue(value)} onValueChange={handleSelect} disabled={disabled}>
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
};

export default PeriodSelect;
