const { execFileSync } = require('child_process');
const { RATE_LIMIT } = require('./config');

function getOAuthToken() {
    try {
        // 環境変数USERのフォールバック
        const username = process.env.USER || process.env.USERNAME || 'unknown';
        const result = execFileSync(
            'security',
            ['find-generic-password', '-a', username, '-w', '-s', RATE_LIMIT.KEYCHAIN_SERVICE],
            { encoding: 'utf8', timeout: 3000, stdio: ['pipe', 'pipe', 'pipe'] }
        );

        const token = result.trim();
        if (!token) return null;

        // JSONとして保存されている場合のパース
        try {
            const parsed = JSON.parse(token);
            if (parsed.claudeAiOauth?.accessToken) {
                return parsed.claudeAiOauth.accessToken;
            }
            // JSON だが accessToken が無い場合は使用不可
            return null;
        } catch (error) {
            // JSONでない場合はそのまま使用
            if (process.env.DEBUG) {
                process.stderr.write(`Token JSON parse: not JSON (${error.message})\n`);
            }
        }

        return token;
    } catch (error) {
        if (process.env.DEBUG) {
            process.stderr.write(`Keychain access error: ${error.message}\n`);
        }
        return null;
    }
}

module.exports = { getOAuthToken };
