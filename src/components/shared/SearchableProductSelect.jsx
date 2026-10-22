import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SearchableProductSelect = ({ 
    productOptions = [], 
    selectedProduct,
    setSelectedProduct,
    placeholder = "Select product..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    const selectedOption = productOptions.find(opt => opt.value === selectedProduct);

    const filteredOptions = [...productOptions]
        .sort((a, b) => (a.label || "").localeCompare(b.label || ""))
        .filter(option => 
            (option.label || "").toLowerCase().includes(searchQuery.toLowerCase())
        );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div 
                className="flex items-center justify-between w-full px-3 py-2 bg-background border border-input rounded-md cursor-text shadow-sm"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-2 w-full">
                    <Search size={16} className="text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        className="w-full bg-transparent focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
                        placeholder={selectedOption ? selectedOption.label : placeholder}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>
                <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                                onClick={() => {
                                    setSelectedProduct(option.value);
                                    setSearchQuery("");
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                            No products found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableProductSelect;