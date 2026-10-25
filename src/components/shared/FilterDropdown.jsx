import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const ALL = "__all__";

/**
 * One dropdown per filter group. The wrapper uses `display: contents`, so inside
 * <SearchFilterBar> every dropdown sits in the same row as the search bar and
 * wraps onto the next line when there's no room.
 *
 * Each trigger has a fixed width and truncates long values with "…", so the text
 * never runs under the chevron. Hovering shows the full value.
 */
const FilterDropdown = ({ filter = {}, updateFilter, filterOptions, className = "contents" }) => {
    if (!Array.isArray(filterOptions) || filterOptions.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            {filterOptions.map((option) => {
                const current = filter[option.key] || ALL;
                const selected = option.options.find((opt) => (opt.value || ALL) === current);
                const display = selected?.label ?? option.label;

                return (
                    <Select
                        key={option.key}
                        value={current}
                        onValueChange={(val) => updateFilter(option.key, val === ALL ? "" : val)}
                    >
                        <SelectTrigger
                            title={display}
                            aria-label={option.label?.replace("Filter: ", "")}
                            className="w-[calc(50%-0.375rem)] sm:w-44 min-w-0 shrink-0 bg-background"
                        >
                            <SelectValue placeholder={option.label} className="min-w-0 flex-1 text-left">
                                <span className="block truncate">{display}</span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-72">
                            {option.options.map((opt) => (
                                <SelectItem key={opt.value || ALL} value={opt.value || ALL}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            })}
        </div>
    );
};

export default FilterDropdown;
