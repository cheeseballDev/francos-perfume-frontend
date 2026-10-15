import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const FilterDropdown = ({ filter, updateFilter, filterOptions }) => {  
    if (!Array.isArray(filterOptions) || filterOptions.length === 0) {
        return null;
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-center gap-3 sm:gap-4 w-full">
        {filterOptions?.map((option) => (
          <Select
            key={option.key}
            value={filter[option.key] || '__all__'}
            onValueChange={(val) => updateFilter(option.key, val === '__all__' ? '' : val)}>
            <SelectTrigger className="w-40">
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