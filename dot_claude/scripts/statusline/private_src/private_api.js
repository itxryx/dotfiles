const https = require('https');
const { RATE_LIMIT } = require('./config');

function fetchUsage(token) {
    return new Promise((resolve) => {
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
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    resolve(null);
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.end();
    });
}

module.exports = { fetchUsage };
