const BLOCKED_NUMBER_KEYS = ["e", "E", "+", "-"];

export const blockInvalidNumberKeys = (event) => {
    if (BLOCKED_NUMBER_KEYS.includes(event.key)) event.preventDefault();
};

export const blockInvalidNumberPaste = (event) => {
    const text = event.clipboardData?.getData("text") ?? "";
    if (/[eE+-]/.test(text)) event.preventDefault();
};
