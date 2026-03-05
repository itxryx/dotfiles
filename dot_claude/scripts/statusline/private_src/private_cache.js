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

        const cacheAge = (Date.now() - cache.timestamp) / 1000;
        if (cacheAge > RATE_LIMIT.CACHE_TTL_SECONDS) return null;

        return cache;
    } catch {
        return null;
    }
}

function writeCache(data) {
    try {
        const cachePath = getCachePath();
        ensureCacheDir(cachePath);
        fs.writeFileSync(cachePath, JSON.stringify({ timestamp: Date.now(), data }, null, 2), 'utf8');
    } catch {
    }
}

function clearCache() {
    try {
        const cachePath = getCachePath();
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath);
        }
    } catch {
    }
}

module.exports = { readCache, writeCache, getCachePath, clearCache };
