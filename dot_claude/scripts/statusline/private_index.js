#!/usr/bin/env node

const path = require('path');

const { COLORS } = require('./src/config');
const { getInput } = require('./src/input');
const { buildStatusOutput } = require('./src/display');

async function main() {
    try {
        const inputData = JSON.parse(await getInput());

        const version = inputData.version || 'unknown';
        const model = inputData.model?.display_name || 'unknown';
        const currentDir = inputData.workspace?.current_dir || inputData.cwd || process.cwd();
        const dirName = path.basename(currentDir);

        const claudeInfo = `${COLORS.primary}[v${version} + ${model}]${COLORS.reset}`;
        const locationInfo = `📁 ${COLORS.secondary}${dirName}${COLORS.reset}`;

        const output = buildStatusOutput(claudeInfo, locationInfo);
        process.stdout.write(output);

    } catch (error) {
        process.stderr.write(`Error: ${error.message}\n`);
        process.exit(1);
    }
}

main();
