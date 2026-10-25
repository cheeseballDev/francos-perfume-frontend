import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const SearchBar = ({ value, onChange, placeholder = "Search by name or id..."}) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Debounce the actual onChange trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        // Send a synthetic event object back to the parent to match your existing e.target.value logic
        onChange({ target: { value: localValue } });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" size={18} />
      </div>
      <input 
        type="text" 
        placeholder={placeholder}
        value={localValue} 
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full h-9 pl-9 pr-4 border border-input bg-background text-foreground rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-colors"
      />
    </div>
  );
};

export default SearchBar;