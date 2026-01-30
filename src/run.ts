#!/usr/bin/env node
/**
 * Simple TUI client for the workflow engine.
 *
 * Run a workflow step-by-step: answer questions, go back, see collected data.
 * In production you'd use React clients or AI voice clients; this is for
 * testing and playing with the engine.
 *
 * Usage:
 *   workflow-tui <file.json>   Load workflow from JSON file (required)
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import type {Workflow, WorkflowData} from '@tatch-ai/workflow-engine';
import type {QuestionNode} from '@tatch-ai/workflow-engine';
import {isQuestionNode, isEndNode, nextNode, validateWorkflow} from '@tatch-ai/workflow-engine';
import {createReadline, promptField, BACK, formatSelectOptions} from './prompt';

const USAGE = 'Usage: workflow-tui <file.json>';

function loadWorkflow(): Workflow {
    const fileArg = process.argv[2];
    if (!fileArg) {
        console.error(chalk.red(USAGE));
        process.exit(1);
    }
    const filePath = path.isAbsolute(fileArg) ? fileArg : path.resolve(process.cwd(), fileArg);
    if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`File not found: ${filePath}`));
        process.exit(1);
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    let json: unknown;
    try {
        json = JSON.parse(raw);
    } catch (err) {
        console.error(chalk.red('Invalid JSON:'), err instanceof Error ? err.message : err);
        process.exit(1);
    }
    return json as Workflow;
}

// =============================================================================
// Main loop
// =============================================================================

async function run(): Promise<void> {
    const workflow = loadWorkflow();
    const validation = validateWorkflow(workflow);
    if (!validation.isValid) {
        console.error(chalk.red('Invalid workflow:'), validation.errors);
        process.exit(1);
    }

    const rl = createReadline();
    const data: WorkflowData = {};
    const history: string[] = [workflow.entryNodeId];
    let currentNodeId = workflow.entryNodeId;

    console.log(chalk.cyan.bold(`\n ${workflow.meta.name} \n`));
    console.log(chalk.gray(workflow.meta.description));
    console.log(chalk.gray('Type "back" at any prompt to go to the previous step.\n'));

    while (true) {
        const node = workflow.nodes[currentNodeId];
        if (!node) {
            console.error(chalk.red(`Invalid node: ${currentNodeId}`));
            process.exit(1);
        }
        if (isEndNode(node)) {
            break;
        }
        if (!isQuestionNode(node)) {
            console.error(chalk.red(`Unknown node type: ${currentNodeId}`));
            process.exit(1);
        }

        const questionNode = node;
        printNode(questionNode);

        let wentBack = false;
        for (const field of questionNode.fields) {
            if (field.readOnly) {
                console.log(chalk.gray(`  ${field.label}: ${String(data[field.id] ?? '—')}`));
                continue;
            }
            if (field.type === 'select' || field.type === 'radio') {
                console.log(formatSelectOptions(field));
            }
            const result = await promptField(rl, field, data);
            if ('back' in result && result.back === BACK) {
                wentBack = true;
                break;
            }
            data[field.id] = (result as {value: unknown}).value;
        }

        if (wentBack) {
            if (history.length <= 1) {
                console.log(chalk.yellow('Already at the start.\n'));
                continue;
            }
            history.pop();
            currentNodeId = history[history.length - 1];
            console.log(chalk.gray(`\n ← Back to: ${currentNodeId}\n`));
            continue;
        }

        const nextId = nextNode(workflow, currentNodeId, data);
        history.push(nextId);
        currentNodeId = nextId;
        console.log();
    }

    rl.close();
    printSummary(workflow, data);
}

function printNode(node: QuestionNode): void {
    console.log(chalk.cyan('─'.repeat(50)));
    console.log(chalk.cyan.bold(`  ${node.label}`));
    if (node.description) {
        console.log(chalk.gray(`  ${node.description}`));
    }
    console.log(chalk.cyan('─'.repeat(50)));
}

function printSummary(workflow: Workflow, data: WorkflowData): void {
    console.log(chalk.green.bold('\n ✓ Application complete \n'));
    console.log(chalk.cyan('Collected data:'));
    console.log(chalk.cyan('─'.repeat(40)));
    for (const [key, value] of Object.entries(data)) {
        const display = value === undefined || value === null ? '—' : String(value);
        console.log(`  ${chalk.gray(key)}: ${display}`);
    }
    console.log(chalk.cyan('─'.repeat(40)));
    console.log(chalk.gray(`\nWorkflow: ${workflow.meta.name} v${workflow.meta.version}\n`));
}

run().catch((err) => {
    console.error(chalk.red('Error:'), err);
    process.exit(1);
});
