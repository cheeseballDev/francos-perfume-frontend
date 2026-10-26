export const isValid = {
    required: (value) => {
        if (value === null || value === undefined || value === '') {
            return 'This field is required';
        }

        if (String(value).trim() === '') {
            return 'This field is required';
        }

        return null;
    },
    
    email: (value) => 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : null,
    
    phone: (value) => 
        !/^(\+63|0)\d{10}$/.test(value.replace(/\s/g, '')) ? 'Invalid phone number' : null,
    
    minLength: (min) => (value) => 
        value.length < min ? `Must be at least ${min} characters` : null,
    
    maxLength: (max) => (value) => 
        value.length > max ? `Must be at most ${max} characters` : null,
    
    noSpecialChars: (value) => 
        /[^a-zA-Z0-9\s]/.test(value) ? 'No special characters allowed' : null,

    numbersOnly: (value) =>
        /\D/.test(value) ? 'Numbers only' : null,

    decimalNumber: (value) =>
        value && !/^\d+(\.\d+)?$/.test(String(value)) ? 'Valid numbers or decimals only' : null,

    prefix: (value) =>
        value.length !== 3 ? `Must be 3 characters only` : null,

    noNumbers: (value) => 
        value && /\d/.test(value) ? 'Numbers are not allowed' : null,

    password: (value) => {
        if (!value) return 'Password is required';
        
        if (value.length < 12) {
            return 'Password must be at least 12 characters';
        }
        if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(value)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(value)) {
            return 'Password must contain at least one number';
        }
        if (!/[#.\-?!@$%^&*]/.test(value)) {
            return 'Password must contain at least one special character (#, ., -, ?, !, @, $, %, ^, &, *)';
        }
        
        return null;
    }

};

export const getPasswordConditions = ({
    password = "",
    firstName,
    lastName,
    oldPassword,
    oldPasswordLabel = "Must be different from temporary password",
} = {}) => {
    const hasValue = password.length > 0;
    const lower = password.toLowerCase();
    const compact = lower.replace(/\s+/g, "");
    const names = [firstName, lastName]
        .map((name) => name?.toLowerCase().replace(/\s+/g, ""))
        .filter((name) => name && name.length >= 2);

    const conditions = [];

    if (oldPassword !== undefined) {
        conditions.push({ key: "isNotOld", label: oldPasswordLabel, met: hasValue && password !== oldPassword });
    }
    if (names.length > 0) {
        conditions.push({ key: "hasNoName", label: "Must not include your name", met: hasValue && !names.some((name) => compact.includes(name)) });
    }

    conditions.push(
        { key: "hasMinLength", label: "12 characters minimum", met: password.length >= 12 },
        { key: "hasUpper", label: "Include uppercase letter", met: /[A-Z]/.test(password) },
        { key: "hasLower", label: "Include lowercase letter", met: /[a-z]/.test(password) },
        { key: "hasNumber", label: "Include number", met: /[0-9]/.test(password) },
        { key: "hasSpecial", label: "Include a special character: (#.-?!@$%^&*)", met: /[#.\-?!@$%^&*]/.test(password) },
    );

    return conditions;
};

export const allPasswordConditionsMet = (conditions) => conditions.every((c) => c.met);

export const checkIfValid = (value, rules = []) => {
    for (const rule of rules) {
        const error = rule(value);
        if (error) return error;
    }
    return null; 
}

export const validateForm = (data, schema) => {
    const errors = {};
    for (const field in schema) {
        const error = checkIfValid(data[field], schema[field]);
        if (error) errors[field] = error;
    }
    return errors;
}; 

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'];
const MAX_SIZE_MB = 5;

export const validateImageFile = (file) => {
    if (!file) return 'No file selected';

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = ALLOWED_TYPES.includes(file.type);
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidType || !isValidExt) {
        return `Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP, GIF, AVIF, SVG`;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return `File too large. Maximum size is ${MAX_SIZE_MB}MB`;
    }

    return null;
};
