import { Input } from "../ui/input";
import { Label } from "../ui/label";

const FormField = ({ label, error, ...props }) => {
    return (
        <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <Input 
            {...props}
            aria-invalid={!!error}
            
        />
        {error && (
            <p className="text-xs font-medium text-destructive mt-0.5">
                {error}
            </p>
        )}
    </div>
    )
    
}


export default FormField;