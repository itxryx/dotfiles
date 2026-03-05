const COLORS = {
    primary: '\x1b[38;5;117m',
    accent: '\x1b[38;5;75m',
    muted: '\x1b[38;5;67m',
    dim: '\x1b[38;5;60m',
    separator: '\x1b[38;5;238m',
    green: '\x1b[38;5;82m',
    yellow: '\x1b[38;5;220m',
    red: '\x1b[38;5;196m',
    reset: '\x1b[0m'
};

const RATE_LIMIT = {
    CACHE_TTL_SECONDS: 300,
    API_TIMEOUT_MS: 5000,
    API_URL: 'https://api.anthropic.com/api/oauth/usage',
    API_BETA_HEADER: 'oauth-2025-04-20',
    KEYCHAIN_SERVICE: 'Claude Code-credentials',
    TIMEZONE: 'Asia/Tokyo'
};

const PROGRESS_BAR = {
    SEGMENTS: 5,
    FILLED: '●',
    EMPTY: '○'
};

module.exports = {
    COLORS,
    RATE_LIMIT,
    PROGRESS_BAR
};
