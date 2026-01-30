/**
 * Commercial GL workflow fixture for the TUI.
 * Same structure as workflow-engine examples/auto-shop.ts.
 */

import type {Workflow} from '@tatch-ai/workflow-engine';

export const commercialWorkflow: Workflow = {
    meta: {
        id: 'commercial-gl',
        name: 'Commercial General Liability Application',
        description: 'Standard GL application for small businesses',
        version: '1.0.0',
        createdAt: '2025-01-29T00:00:00Z',
        updatedAt: '2025-01-29T00:00:00Z',
        source: 'acord-125-commercial-application.pdf',
    },
    entryNodeId: 'business-info',
    nodes: {
        'business-info': {
            type: 'question',
            id: 'business-info',
            label: 'Business Information',
            description: 'Basic information about your business',
            fields: [
                {
                    id: 'businessName',
                    type: 'text',
                    label: 'What is the name of your business?',
                    validation: {required: true},
                    readOnly: false,
                },
                {
                    id: 'hasEmployees',
                    type: 'boolean',
                    label: 'Does your business have employees?',
                    validation: {required: true},
                    readOnly: false,
                },
                {
                    id: 'annualRevenue',
                    type: 'currency',
                    label: 'What is your annual revenue?',
                    currency: 'USD',
                    validation: {required: true, min: 0},
                    readOnly: false,
                },
            ],
            defaultEdge: 'coverage-selection',
            conditionalEdges: [
                {
                    targetNodeId: 'employee-details',
                    condition: {fieldId: 'hasEmployees', operator: 'eq', value: true},
                },
            ],
        },
        'employee-details': {
            type: 'question',
            id: 'employee-details',
            label: 'Employee Information',
            description: "Required for workers' compensation",
            fields: [
                {
                    id: 'employeeCount',
                    type: 'number',
                    label: 'Number of Employees',
                    validation: {required: true, min: 1},
                    readOnly: false,
                },
                {
                    id: 'operatesHeavyEquipment',
                    type: 'boolean',
                    label: 'Any employees operate heavy equipment?',
                    validation: {required: true},
                    readOnly: false,
                },
            ],
            defaultEdge: 'coverage-selection',
            conditionalEdges: [],
        },
        'coverage-selection': {
            type: 'question',
            id: 'coverage-selection',
            label: 'Coverage Options',
            description: 'Select your coverage level',
            fields: [
                {
                    id: 'coverageType',
                    type: 'select',
                    label: 'Coverage Level',
                    options: [
                        {value: 'basic', label: 'Basic'},
                        {value: 'standard', label: 'Standard'},
                        {value: 'premium', label: 'Premium'},
                    ],
                    validation: {required: true},
                    readOnly: false,
                },
            ],
            defaultEdge: 'review',
            conditionalEdges: [
                {
                    targetNodeId: 'high-risk-questions',
                    condition: {fieldId: 'operatesHeavyEquipment', operator: 'eq', value: true},
                },
            ],
        },
        'high-risk-questions': {
            type: 'question',
            id: 'high-risk-questions',
            label: 'High Risk Assessment',
            description: 'Additional questions for high-risk operations',
            fields: [
                {
                    id: 'priorIncidents',
                    type: 'number',
                    label: 'Incidents in past 3 years',
                    validation: {required: true, min: 0},
                    readOnly: false,
                },
                {
                    id: 'safetyTraining',
                    type: 'boolean',
                    label: 'Staff completed safety training?',
                    validation: {required: true},
                    readOnly: false,
                },
            ],
            defaultEdge: 'review',
            conditionalEdges: [],
        },
        review: {
            type: 'question',
            id: 'review',
            label: 'Review & Submit',
            description: 'Review your application',
            fields: [
                {
                    id: 'agreeToTerms',
                    type: 'boolean',
                    label: 'I agree to the terms and conditions',
                    validation: {required: true},
                    readOnly: false,
                },
            ],
            defaultEdge: 'complete',
            conditionalEdges: [],
        },
        complete: {
            type: 'end',
            id: 'complete',
            status: 'complete',
        },
    },
};
