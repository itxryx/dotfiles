const { COLORS, PROGRESS_BAR, RATE_LIMIT, getUsageColor } = require('./config');
const { getOAuthToken } = require('./keychain');
const { readCache, writeCache } = require('./cache');
const { fetchUsage } = require('./api');

function buildProgressBar(percentage) {
    const rawCount = Math.round((percentage / 100) * PROGRESS_BAR.SEGMENTS);
    // 1%以上の場合は最低1個の●を表示。SEGMENTS数を超えないようクランプ
    const filledCount = percentage > 0
        ? Math.min(Math.max(1, rawCount), PROGRESS_BAR.SEGMENTS)
        : 0;
    const dots = Array(PROGRESS_BAR.SEGMENTS).fill(PROGRESS_BAR.EMPTY);
    for (let i = 0; i < filledCount; i++) {
        dots[i] = PROGRESS_BAR.FILLED;
    }
    return dots.join(' ');
}

function formatResetTime(isoString, type) {
    // null/undefined/空文字列のチェック
    if (!isoString) {
        return 'Resets N/A';
    }

    const date = new Date(isoString);

    // 無効な日付のチェック
    if (isNaN(date.getTime())) {
        return 'Resets N/A';
    }

    const options = { timeZone: RATE_LIMIT.TIMEZONE, hour: 'numeric', hour12: true };

    // 5h以外はすべて月日付きフォーマット
    if (type !== '5h') {
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
    // utilizationの厳密な数値化
    const rawUtilization = data.utilization;
    const numUtilization = typeof rawUtilization === 'number' ? rawUtilization : parseFloat(rawUtilization);
    const safeUtilization = !isNaN(numUtilization) && isFinite(numUtilization) ? numUtilization : 0;
    const percentage = Math.round(safeUtilization);

    const progressBar = buildProgressBar(percentage);
    const color = getUsageColor(percentage);
    const resetTime = formatResetTime(data.resets_at, label);

    const paddedLabel = label.padEnd(3);
    const paddedPercentage = `${percentage}%`.padStart(4);

    const tzAbbr = new Intl.DateTimeFormat('en-US', { timeZone: RATE_LIMIT.TIMEZONE, timeZoneName: 'short' })
        .formatToParts(new Date())
        .find(p => p.type === 'timeZoneName')?.value ?? RATE_LIMIT.TIMEZONE;

    return `${COLORS.muted}${paddedLabel}${COLORS.reset} ${color}${progressBar}${COLORS.reset} ${color}${paddedPercentage}${COLORS.reset} ${COLORS.dim}${resetTime} (${tzAbbr})${COLORS.reset}`;
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

    const token = getOAuthToken();
    if (!token) return null;

    const usage = await fetchUsage(token);
    if (!usage) return null;

    writeCache(usage);
    return formatRateLimitOutput(usage);
}

module.exports = { getRateLimitDisplay, buildProgressBar, formatResetTime };
