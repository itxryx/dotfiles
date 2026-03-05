#!/usr/bin/env node

const path = require('path');

const { COLORS } = require('./src/config');
const { getInput } = require('./src/input');
const { buildStatusOutput } = require('./src/display');
const { getRateLimitDisplay } = require('./src/rateLimit');

function getUsageColor(percentage) {
    if (percentage < 50) {
        return COLORS.green;
    } else if (percentage < 80) {
        return COLORS.yellow;
    } else {
        return COLORS.red;
    }
}

async function main() {
    try {
        const [inputRaw, rateLimitInfo] = await Promise.all([
            getInput(),
            getRateLimitDisplay()
        ]);

        const inputData = JSON.parse(inputRaw);

        const version = inputData.version || 'unknown';
        const model = inputData.model?.display_name || 'unknown';
        const currentDir = inputData.workspace?.current_dir || inputData.cwd || process.cwd();
        const dirName = path.basename(currentDir);
        const usedPercentage = inputData.context_window?.used_percentage ?? 0;

        const claudeInfo = `${COLORS.primary}[v${version} + ${model}]${COLORS.reset}`;
        const locationInfo = `📁 ${COLORS.primary}${dirName}${COLORS.reset}`;
        const separator = `${COLORS.separator}|${COLORS.reset}`;
        const usageColor = getUsageColor(usedPercentage);
        const contextInfo = `📊 ${usageColor}${usedPercentage}%${COLORS.reset}`;

        const output = buildStatusOutput(claudeInfo, locationInfo, separator, contextInfo, rateLimitInfo);
        process.stdout.write(output);

    } catch (error) {
        process.stderr.write(`Error: ${error.message}\n`);
        process.exit(1);
    }
}

main();
