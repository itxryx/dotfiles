const https = require('https');
const { RATE_LIMIT } = require('./config');

function fetchUsage(token) {
    return new Promise((resolve) => {
        let resolved = false;
        const safeResolve = (value) => {
            if (!resolved) {
                resolved = true;
                resolve(value);
            }
        };

        const url = new URL(RATE_LIMIT.API_URL);

        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'GET',
            timeout: RATE_LIMIT.API_TIMEOUT_MS,
            headers: {
                'Authorization': `Bearer ${token}`,
                'anthropic-beta': RATE_LIMIT.API_BETA_HEADER,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            let dataSize = 0;

            res.on('data', (chunk) => {
                dataSize += chunk.length;
                if (dataSize > RATE_LIMIT.API_MAX_RESPONSE_SIZE) {
                    // サイズ制限超過: 接続を切断
                    res.destroy();
                    safeResolve(null);
                    return;
                }
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode !== 200) {
                    if (process.env.DEBUG) {
                        process.stderr.write(`API error: HTTP ${res.statusCode}\n`);
                    }
                    safeResolve(null);
                    return;
                }
                try {
                    safeResolve(JSON.parse(data));
                } catch (error) {
                    if (process.env.DEBUG) {
                        process.stderr.write(`API JSON parse error: ${error.message}\n`);
                    }
                    safeResolve(null);
                }
            });
        });

        req.on('error', (error) => {
            if (process.env.DEBUG) {
                process.stderr.write(`API request error: ${error.message}\n`);
            }
            safeResolve(null);
        });
        req.on('timeout', () => {
            if (process.env.DEBUG) {
                process.stderr.write('API request timeout\n');
            }
            req.destroy();
            safeResolve(null);
        });
        req.end();
    });
}

module.exports = { fetchUsage };
