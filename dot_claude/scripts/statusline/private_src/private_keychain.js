const { execSync } = require('child_process');
const { RATE_LIMIT } = require('./config');

function getOAuthToken() {
    return new Promise((resolve) => {
        try {
            // 環境変数USERのフォールバック
            const username = process.env.USER || process.env.USERNAME || 'unknown';
            const command = `security find-generic-password -a "${username}" -w -s "${RATE_LIMIT.KEYCHAIN_SERVICE}"`;
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
            } catch (error) {
                // JSONでない場合はそのまま使用
                if (process.env.DEBUG) {
                    process.stderr.write(`Token JSON parse: not JSON (${error.message})\n`);
                }
            }

            resolve(token);
        } catch (error) {
            if (process.env.DEBUG) {
                process.stderr.write(`Keychain access error: ${error.message}\n`);
            }
            resolve(null);
        }
    });
}

module.exports = { getOAuthToken };
