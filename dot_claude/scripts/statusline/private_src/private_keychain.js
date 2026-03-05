const { execSync } = require('child_process');
const { RATE_LIMIT } = require('./config');

function getOAuthToken() {
    return new Promise((resolve) => {
        try {
            const command = `security find-generic-password -a "$USER" -w -s "${RATE_LIMIT.KEYCHAIN_SERVICE}"`;
            const result = execSync(command, {
                encoding: 'utf8',
                timeout: 3000,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            const token = result.trim();
            if (!token) {
                resolve(null);
                return;
            }

            // JSONとして保存されている場合のパース
            try {
                const parsed = JSON.parse(token);
                if (parsed.claudeAiOauth?.accessToken) {
                    resolve(parsed.claudeAiOauth.accessToken);
                    return;
                }
            } catch {
                // JSONでない場合はそのまま使用
            }

            resolve(token);
        } catch {
            resolve(null);
        }
    });
}

module.exports = { getOAuthToken };
