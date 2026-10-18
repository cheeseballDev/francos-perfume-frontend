import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useId } from "react"; // Added to generate unique IDs for screen readers

const FormField = ({ label, error, ...props }) => {
    // Generate a unique ID for this specific instance's error message
    const errorId = useId();

    return (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <Input 
                {...props}
                aria-invalid={!!error}
                // FIXED: Screen readers will now announce the error text when the input is focused
                aria-describedby={error ? errorId : undefined}
            />
            {error && (
                <p 
                    id={errorId} 
                    className="text-xs font-medium text-destructive mt-0.5 transition-opacity duration-200"
                    role="alert" // A11y tag to force immediate announcement
                >
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormField;