import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search by name or id..."}) => {
  return (
    <div className="relative w-64">
      {/* FIXED: Removed the stray '0' typo in the class name (pl-3 0) */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {/* FIXED: Replaced text-custom-gray with text-muted-foreground */}
        <Search className="h-4 w-4 text-muted-foreground" size={18} />
      </div>
      <input 
        type="text" 
        placeholder={placeholder}
        value={value} 
        onChange={onChange} // This triggers the parent's state update!
        // FIXED: Replaced custom grays with border-border and focus:border-primary. Added bg-background and text-foreground.
        className="w-full pl-9 pr-4 py-2 border border-border bg-background text-foreground rounded text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
};

export default SearchBar;