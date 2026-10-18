import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search by name or id..."}) => {
  return (
    // FIXED: Increased length. Replaced w-64 with w-full sm:w-96 for a much longer search bar.
    <div className="relative w-full sm:w-96">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" size={18} />
      </div>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value} 
        onChange={onChange}
        className="w-full pl-9 pr-4 py-2 border border-border bg-background text-foreground rounded text-sm focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
};

export default SearchBar;