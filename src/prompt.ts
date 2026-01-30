/**
 * Prompt user for field values in the CLI.
 * Uses readline for input; supports "back" to go to previous node.
 */

import * as readline from 'readline';
import type {FieldDefinition, WorkflowData} from '@tatch-ai/workflow-engine';
import {validateFieldValue} from './validate';

const BACK_COMMAND = 'back';

/**
 * Returns a short type hint for the prompt so users know what format to enter.
 */
function getTypeHint(field: FieldDefinition): string {
    switch (field.type) {
        case 'text':
            return '(text)';
        case 'textarea':
            return '(text)';
        case 'email':
            return '(email)';
        case 'phone':
            return '(phone)';
        case 'number':
            return '(number)';
        case 'currency':
            return '(number, $ optional e.g. 50000 or $50,000)';
        case 'boolean':
            return '(y/n)';
        case 'select':
        case 'radio':
            return '(number or value)';
        case 'date':
            return '(YYYY-MM-DD)';
        case 'checkboxGroup':
            return '(comma-separated values)';
        default:
            return '';
    }
}

/** Sentinel returned when user types "back" to go to previous node. */
export const BACK = Symbol('back');
export type PromptResult = {value: unknown} | {back: typeof BACK};

export function createReadline(): readline.Interface {
    return readline.createInterface({input: process.stdin, output: process.stdout});
}

/**
 * Ask a single question and resolve with the answer or BACK_COMMAND.
 */
export function ask(rl: readline.Interface, promptText: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            resolve(answer.trim());
        });
    });
}

/**
 * Prompt for a single field. Validates and re-prompts on error.
 * Returns { value } or { back: BACK } if user typed "back".
 */
export async function promptField(
    rl: readline.Interface,
    field: FieldDefinition,
    existingData: WorkflowData,
): Promise<PromptResult> {
    const existing = existingData[field.id];
    const typeHint = getTypeHint(field);
    const defaultHint = existing !== undefined && existing !== null && existing !== '' ? ` [${existing}]` : '';
    const label = `${field.label} ${typeHint}${defaultHint}: `;

    while (true) {
        const raw = await ask(rl, label);
        if (raw.toLowerCase() === BACK_COMMAND) return {back: BACK};

        const valueToValidate = raw === '' && defaultHint ? existing : parseFieldInput(field, raw, existing);
        const error = validateFieldValue(field, valueToValidate);
        if (error) {
            console.log(`  ⚠ ${error}\n`);
            continue;
        }
        return {value: valueToValidate};
    }
}

/**
 * Parse raw string input into the correct type for the field.
 */
function parseFieldInput(field: FieldDefinition, raw: string, existing: unknown): unknown {
    if (raw === '' && existing !== undefined && existing !== null) return existing;

    switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'phone':
            return raw;
        case 'number':
            return raw === '' ? undefined : Number(raw);
        case 'currency': {
            const cleaned = raw.replace(/[$,]/g, '');
            return cleaned === '' ? undefined : Number(cleaned);
        }
        case 'boolean': {
            const lower = raw.toLowerCase();
            if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === '1') return true;
            if (lower === 'n' || lower === 'no' || lower === 'false' || lower === '0') return false;
            return undefined;
        }
        case 'select':
        case 'radio': {
            const opts = field.options;
            const byIndex = raw.match(/^\d+$/) ? opts[Number(raw) - 1] : undefined;
            const byValue = opts.find((o) => o.value === raw || o.label.toLowerCase() === raw.toLowerCase());
            return (byIndex ?? byValue)?.value ?? raw;
        }
        case 'date':
            return raw;
        case 'checkboxGroup':
            return raw.split(',').map((s) => s.trim()).filter(Boolean);
        default:
            return raw;
    }
}

/**
 * Format options for select/radio for display.
 */
export function formatSelectOptions(field: FieldDefinition & {options: {value: string; label: string}[]}): string {
    return field.options.map((o, i) => `  ${i + 1}. ${o.label} (${o.value})`).join('\n');
}
