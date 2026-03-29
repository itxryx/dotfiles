const fs = require('fs');
const path = require('path');
const { RATE_LIMIT } = require('./config');

function getCachePath() {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    return path.join(homeDir, '.claude', 'scripts', 'statusline', 'tmp', 'cc-usage-cache.json');
}

function ensureCacheDir(cachePath) {
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readCache() {
    try {
        const cachePath = getCachePath();
        if (!fs.existsSync(cachePath)) return null;

        const content = fs.readFileSync(cachePath, 'utf8');
        const cache = JSON.parse(content);

        if (typeof cache.timestamp !== 'number') return null;
        const cacheAge = (Date.now() - cache.timestamp) / 1000;
        if (cacheAge > RATE_LIMIT.CACHE_TTL_SECONDS) return null;

        return cache;
    } catch (error) {
        if (process.env.DEBUG) {
            process.stderr.write(`Cache read error: ${error.message}\n`);
        }
        return null;
    }
}

function writeCache(data) {
    try {
        const cachePath = getCachePath();
        ensureCacheDir(cachePath);

        // Atomic write: 一時ファイルに書き込み後にrenameで競合を防ぐ
        const tmpPath = cachePath + '.tmp.' + process.pid;
        try {
            fs.writeFileSync(tmpPath, JSON.stringify({ timestamp: Date.now(), data }, null, 2), 'utf8');
            fs.renameSync(tmpPath, cachePath);
        } finally {
            try { fs.unlinkSync(tmpPath); } catch (_) { /* rename済みなら無視 */ }
        }
    } catch (error) {
        if (process.env.DEBUG) {
            process.stderr.write(`Cache write error: ${error.message}\n`);
        }
    }
}

function clearCache() {
    try {
        const cachePath = getCachePath();
        fs.unlinkSync(cachePath);
    } catch (error) {
        if (error.code === 'ENOENT') return;
        if (process.env.DEBUG) {
            process.stderr.write(`Cache clear error: ${error.message}\n`);
        }
    }
}

module.exports = { readCache, writeCache, getCachePath, clearCache };
