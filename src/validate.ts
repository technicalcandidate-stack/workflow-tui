/**
 * Simple runtime validation for field values in the CLI.
 * Mirrors FieldValidation rules (required, min, max, pattern).
 */

import type {FieldDefinition} from '@tatch-ai/workflow-engine';

/**
 * Validates a single field value against its definition.
 * Returns the first error message or null if valid.
 */
export function validateFieldValue(
    field: FieldDefinition,
    value: unknown,
): string | null {
    const {validation} = field;

    if (value === undefined || value === null || value === '') {
        if (validation.required) {
            return 'This field is required.';
        }
        return null;
    }

    switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'phone': {
            const s = String(value).trim();
            if (validation.required && s.length === 0) return 'This field is required.';
            if (validation.min !== undefined && s.length < validation.min) {
                return `Must be at least ${validation.min} characters.`;
            }
            if (validation.max !== undefined && s.length > validation.max) {
                return `Must be at most ${validation.max} characters.`;
            }
            if (validation.pattern) {
                try {
                    const re = new RegExp(validation.pattern);
                    if (!re.test(s)) return 'Invalid format.';
                } catch {
                    // ignore invalid regex
                }
            }
            return null;
        }
        case 'number':
        case 'currency': {
            const n = typeof value === 'number' ? value : Number(value);
            if (Number.isNaN(n)) return 'Please enter a valid number.';
            if (validation.min !== undefined && n < validation.min) {
                return `Must be at least ${validation.min}.`;
            }
            if (validation.max !== undefined && n > validation.max) {
                return `Must be at most ${validation.max}.`;
            }
            return null;
        }
        case 'boolean':
            if (typeof value !== 'boolean') return 'Please answer yes or no.';
            return null;
        case 'select':
        case 'radio': {
            const opts = field.options.map((o) => o.value);
            if (!opts.includes(String(value))) {
                return `Choose one of: ${opts.join(', ')}`;
            }
            return null;
        }
        case 'checkboxGroup':
            if (!Array.isArray(value)) return 'Please select one or more options.';
            const opts = field.options.map((o) => o.value);
            for (const v of value) {
                if (!opts.includes(String(v))) return `Invalid option: ${v}`;
            }
            return null;
        case 'date': {
            const d = typeof value === 'string' ? value : String(value);
            const parsed = new Date(d);
            if (Number.isNaN(parsed.getTime())) return 'Please enter a valid date (YYYY-MM-DD).';
            if (field.minDate && d < field.minDate) return `Date must be on or after ${field.minDate}.`;
            if (field.maxDate && d > field.maxDate) return `Date must be on or before ${field.maxDate}.`;
            return null;
        }
        default:
            return null;
    }
}
