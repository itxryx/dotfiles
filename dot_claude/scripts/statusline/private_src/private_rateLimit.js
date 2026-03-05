const { COLORS, PROGRESS_BAR, RATE_LIMIT } = require('./config');
const { getOAuthToken } = require('./keychain');
const { readCache, writeCache } = require('./cache');
const { fetchUsage } = require('./api');

function buildProgressBar(percentage) {
    const filledCount = Math.round((percentage / 100) * PROGRESS_BAR.SEGMENTS);
    const emptyCount = PROGRESS_BAR.SEGMENTS - filledCount;
    const dots = Array(PROGRESS_BAR.SEGMENTS).fill(PROGRESS_BAR.EMPTY);
    for (let i = 0; i < filledCount; i++) {
        dots[i] = PROGRESS_BAR.FILLED;
    }
    return dots.join(' ');
}

function getUsageColor(percentage) {
    if (percentage < 50) return COLORS.green;
    if (percentage < 80) return COLORS.yellow;
    return COLORS.red;
}

function formatResetTime(isoString, type) {
    const date = new Date(isoString);
    const options = { timeZone: RATE_LIMIT.TIMEZONE, hour: 'numeric', hour12: true };

    if (type === '7d') {
        options.month = 'short';
        options.day = 'numeric';
    }

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    const partsMap = {};
    parts.forEach(part => { partsMap[part.type] = part.value; });

    const hour = partsMap.hour;
    const dayPeriod = partsMap.dayPeriod?.toLowerCase() || '';
    const timeStr = `${hour}${dayPeriod}`;

    if (type === '5h') {
        return `Resets ${timeStr}`;
    }
    return `Resets ${partsMap.month} ${partsMap.day} at ${timeStr}`;
}

function formatRateLimitLine(label, data) {
    const percentage = Math.round(data.utilization);
    const progressBar = buildProgressBar(percentage);
    const color = getUsageColor(percentage);
    const resetTime = formatResetTime(data.resets_at, label);

    const paddedLabel = label.padEnd(3);
    const paddedPercentage = `${percentage}%`.padStart(4);

    return `${COLORS.muted}${paddedLabel}${COLORS.reset} ${color}${progressBar}${COLORS.reset} ${color}${paddedPercentage}${COLORS.reset} ${COLORS.dim}${resetTime} (JST)${COLORS.reset}`;
}

function formatRateLimitOutput(usage) {
    const lines = [];
    if (usage.five_hour) lines.push(formatRateLimitLine('5h', usage.five_hour));
    if (usage.seven_day) lines.push(formatRateLimitLine('7d', usage.seven_day));
    return lines.join('\n');
}

async function getRateLimitDisplay() {
    const cached = readCache();
    if (cached?.data) return formatRateLimitOutput(cached.data);

    const token = await getOAuthToken();
    if (!token) return null;

    const usage = await fetchUsage(token);
    if (!usage) return null;

    writeCache(usage);
    return formatRateLimitOutput(usage);
}

module.exports = { getRateLimitDisplay, buildProgressBar, formatResetTime, getUsageColor };
