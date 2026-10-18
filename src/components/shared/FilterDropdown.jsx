import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const FilterDropdown = ({ filter, updateFilter, filterOptions }) => {  
    if (!Array.isArray(filterOptions) || filterOptions.length === 0) {
        return null;
    }
    
    return (
      // FIXED: Removed w-full and hard grid columns. Used flex flex-wrap so it sits inline with the Search Bar.
      <div className="flex flex-wrap items-center gap-3">
        {filterOptions?.map((option) => (
          <Select
            key={option.key}
            value={filter[option.key] || '__all__'}
            onValueChange={(val) => updateFilter(option.key, val === '__all__' ? '' : val)}>
            <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder={option.label} />
            </SelectTrigger>
            <SelectContent>
                {option.options.map((opt) => (
                    <SelectItem
                        key={opt.label}
                        value={opt.value || '__all__'}
                    >
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        ))}
    </div>
    )
}

export default FilterDropdown;