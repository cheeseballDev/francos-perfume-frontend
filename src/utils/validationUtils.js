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