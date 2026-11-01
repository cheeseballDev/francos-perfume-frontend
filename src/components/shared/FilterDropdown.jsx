import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const ALL = "__all__";

const toSelection = (value) => {
    if (Array.isArray(value)) return value.filter((item) => item !== "" && item !== ALL);
    if (value === undefined || value === null || value === "" || value === ALL) return [];
    return [value];
};

const FilterDropdown = ({ filter = {}, updateFilter, filterOptions, className = "contents" }) => {
    if (!Array.isArray(filterOptions) || filterOptions.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            {filterOptions.map((option) => {
                const choices = option.options.filter((opt) => opt.value !== "" && opt.value !== ALL);
                const allLabel = option.options.find((opt) => opt.value === "" || opt.value === ALL)?.label ?? option.label;
                const selected = toSelection(filter[option.key]);
                const selectedLabels = choices.filter((opt) => selected.includes(opt.value)).map((opt) => opt.label);
                const groupName = option.label?.replace("Filter: ", "") ?? "";
                const isMultiple = option.multiple !== false;

                const display = selectedLabels.length === 0
                    ? allLabel
                    : selectedLabels.length === 1
                        ? selectedLabels[0]
                        : `${groupName}: ${selectedLabels.length} selected`;

                const toggle = (value, checked) => {
                    const next = checked
                        ? [...selected, value]
                        : selected.filter((item) => item !== value);
                    updateFilter(option.key, next);
                };

                return (
                    <DropdownMenu key={option.key} modal={false}>
                        <DropdownMenuTrigger
                            title={selectedLabels.length > 1 ? selectedLabels.join(", ") : display}
                            aria-label={groupName}
                            className={`flex h-9 items-center justify-between gap-2 rounded-md border border-input px-3 text-sm w-[calc(50%-0.375rem)] sm:w-44 min-w-0 shrink-0 bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                selected.length > 0 ? "border-primary font-medium" : ""
                            }`}
                        >
                            <span className="block truncate text-left">{display}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-72 min-w-48" align="start">
                            <DropdownMenuItem
                                disabled={selected.length === 0}
                                onSelect={() => updateFilter(option.key, isMultiple ? [] : "")}
                                className="font-medium"
                            >
                                {allLabel}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {isMultiple ? (
                                choices.map((opt) => (
                                    <DropdownMenuCheckboxItem
                                        key={opt.value}
                                        checked={selected.includes(opt.value)}
                                        onCheckedChange={(checked) => toggle(opt.value, checked)}
                                        onSelect={(event) => event.preventDefault()}
                                    >
                                        {opt.label}
                                    </DropdownMenuCheckboxItem>
                                ))
                            ) : (
                                <DropdownMenuRadioGroup
                                    value={selected[0] ?? ""}
                                    onValueChange={(value) => updateFilter(option.key, value)}
                                >
                                    {choices.map((opt) => (
                                        <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            })}
        </div>
    );
};

export default FilterDropdown;
