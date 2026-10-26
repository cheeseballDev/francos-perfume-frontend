import { useRef } from "react";

const OTPInput = ({ value, onChange, disabled = false, length = 6 }) => {
    const refs = useRef([]);

    const setDigit = (index, digit) => {
        const next = [...value];
        next[index] = digit;
        onChange(next);
    };

    const handleChange = (e, index) => {
        const digit = e.target.value.replace(/\D/g, "").slice(-1);
        setDigit(index, digit);
        if (digit && index < length - 1) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !value[index] && index > 0) refs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length).split("");
        if (!digits.length) return;
        const next = [...value];
        digits.forEach((d, i) => { next[i] = d; });
        onChange(next);
        refs.current[Math.min(digits.length, length - 1)]?.focus();
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3">
            {value.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (refs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    autoFocus={index === 0}
                    aria-label={`Digit ${index + 1}`}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
            ))}
        </div>
    );
};

export default OTPInput;