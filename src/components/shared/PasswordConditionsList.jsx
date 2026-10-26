import { Check, X } from "lucide-react";

// The live checklist shown under a new-password field. Green = met, red = not yet.
const PasswordConditionsList = ({ conditions, title = "Password conditions (MUST HAVE):" }) => (
    <div className="pt-2">
        <p className="text-[15px] font-bold text-foreground mb-2">{title}</p>
        <ul className="text-sm space-y-1.5 ml-1" aria-live="polite">
            {conditions.map((condition) => (
                <li
                    key={condition.key}
                    className={`flex items-start gap-2 transition-colors ${condition.met ? "text-green-600 dark:text-green-500 font-medium" : "text-destructive"}`}
                >
                    {condition.met
                        ? <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        : <X size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
                    <span>
                        {condition.label}
                        <span className="sr-only">{condition.met ? " (met)" : " (not met)"}</span>
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

export default PasswordConditionsList;
