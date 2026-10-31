import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SearchableProductSelect = ({ 
    productOptions = [], 
    selectedProduct,
    setSelectedProduct,
    placeholder = "Select product...",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState({});
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    const selectedOption = productOptions.find(opt => opt.value === selectedProduct);

    const filteredOptions = [...productOptions]
        .sort((a, b) => (a.label || "").localeCompare(b.label || ""))
        .filter(option =>
            (option.label || "").toLowerCase().includes(searchQuery.toLowerCase())
        );

    const updateDropdownPosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
    };

    const handleOpen = () => {
        updateDropdownPosition();
        setIsOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleScroll = () => updateDropdownPosition();
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    return (
        <div className="relative w-full" ref={triggerRef}>
            <div
                className="flex items-center justify-between w-full px-3 py-2 bg-background border border-input rounded-md cursor-text shadow-sm"
                onClick={handleOpen}
            >
                <div className="flex items-center gap-2 w-full relative">
                    <Search size={16} className="text-muted-foreground shrink-0" />
                    
                    <input
                        type="text"
                        className="w-full bg-transparent focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
                        placeholder={isOpen ? placeholder : ""}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleOpen();
                        }}
                        onFocus={handleOpen}
                    />

                    {!isOpen && selectedOption && (
                        <div 
                            className="absolute left-6 right-2 text-sm text-foreground truncate pointer-events-none bg-background font-normal"
                        >
                            {selectedOption.label}
                        </div>
                    )}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-muted-foreground shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${
                                    selectedProduct === option.value ? 'bg-accent font-medium' : ''
                                }`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSelectedProduct(option.value);
                                    setSearchQuery('');
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
                </div>,
                document.body
            )}
        </div>
    );
};

export default SearchableProductSelect;