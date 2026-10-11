import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter, Search } from 'lucide-react';

const PointOfSaleFilterBar = ({ filter, updateFilter }) => {

    return (
    <div className="flex gap-3 mb-6 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter size={18} />
                Filter {(filter.product_type !== '' || filter.product_gender !== '') && <span className="w-2 h-2 rounded-full bg-primary" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Product Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['', 'PREMIUM', 'CLASSIC'].map((type) => (
                <DropdownMenuCheckboxItem
                  key={type || 'ALL'}
                  checked={filter.product_type === type}
                  onCheckedChange={() => updateFilter('product_type', type)}
                >
                  {type || 'ALL'}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Gender</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['ALL', 'MEN', 'WOMEN', 'UNISEX'].map((gender) => (
                <DropdownMenuCheckboxItem
                  key={gender || 'ALL'}
                  checked={filter.product_gender === gender}
                  onCheckedChange={() => updateFilter('product_gender', gender)}
                >
                  {gender || 'ALL'}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  );
};

export default PointOfSaleFilterBar;