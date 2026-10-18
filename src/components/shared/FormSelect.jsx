import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const FormSelect = ({ label, value, onChange, options = [], placeholder, disabled}) => {
    return (
        <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        {/* FIXED: Removed hardcoded bg-white, replaced with bg-background for dark mode support */}
        <SelectTrigger className="w-full bg-background transition-colors">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="w-[--radix-select-trigger-width] max-h-60 hover:cursor-pointer"
          onCloseAutoFocus={(e) => e.preventDefault()}
        > 
          {options.map((option) => {
            const optValue = typeof option === "object" ? option.value : option;
            const optLabel = typeof option === "object" ? option.label : option;
            return (
              <SelectItem 
                className="hover:cursor-pointer transition-colors"
                key={optValue} 
                value={optValue}
              >
                {optLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
    )
}
    
export default FormSelect;