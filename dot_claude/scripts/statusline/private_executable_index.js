#!/usr/bin/env node

const path = require('path');

const { COLORS, getUsageColor } = require('./src/config');
const { getInput } = require('./src/input');
const { buildStatusOutput } = require('./src/display');
const { getRateLimitDisplay } = require('./src/rateLimit');

async function main() {
    try {
        const [inputRaw, rateLimitInfo] = await Promise.all([
            getInput(),
            getRateLimitDisplay()
        ]);

        let inputData = {};
        try {
            inputData = JSON.parse(inputRaw);
        } catch (parseError) {
            // JSONパースエラー時はデフォルト値を使用（ステータスラインは表示を継続）
            if (process.env.DEBUG) {
                process.stderr.write(`JSON parse warning: ${parseError.message}\n`);
            }
        }

        const version = inputData.version || 'unknown';
        const model = inputData.model?.display_name || 'unknown';
        const currentDir = inputData.workspace?.current_dir || inputData.cwd || process.cwd();
        const dirName = path.basename(currentDir);

        // used_percentageの厳密な数値化
        const rawPercentage = inputData.context_window?.used_percentage;
        const numPercentage = typeof rawPercentage === 'number' ? rawPercentage : parseFloat(rawPercentage);
        const usedPercentage = !isNaN(numPercentage) && isFinite(numPercentage) ? numPercentage : 0;

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
