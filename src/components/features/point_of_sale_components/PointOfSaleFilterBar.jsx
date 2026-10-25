import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter, Search } from 'lucide-react';

const PointOfSaleFilterBar = ({ filter, filterOptions = [], updateFilter }) => {
    if (!Array.isArray(filterOptions) || filterOptions.length === 0) {
        return null;
    }

    const hasActiveFilters = filterOptions.some(group => {
        const val = filter[group.key];
        return val !== undefined && val !== '' && val !== null;
    });

    return (
        <div className="flex flex-wrap gap-3 mb-6 items-center">
            <div className="relative min-w-[16rem] flex-[1_1_24rem]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={filter.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 shrink-0">
                        <Filter size={18} />
                        Filter {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    {filterOptions.map((group, groupIndex) => (
                        <div key={group.key || groupIndex}>
                            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {group.options.map((opt) => {
                                const isChecked = (filter[group.key] || '') === opt.value;
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={opt.label}
                                        checked={isChecked}
                                        onCheckedChange={() => updateFilter(group.key, opt.value)}
                                    >
                                        {opt.label}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                            {groupIndex < filterOptions.length - 1 && <DropdownMenuSeparator className="my-1" />}
                        </div>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
  );
};

export default PointOfSaleFilterBar;