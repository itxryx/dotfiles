# Claude Code Statusline

Claude Code 用カスタムステータスライン。stdin から JSON を受け取り、フォーマットした文字列を stdout へ出力する。外部 npm 依存なし（Node.js 標準モジュールのみ）。

## ディレクトリ構造

```
statusline/
├── index.js          # エントリーポイント: getInput と getRateLimitDisplay を並列実行後に出力
├── clear-cache.js    # cache.js の clearCache() を呼ぶだけ
└── src/
    ├── config.js     # ANSI カラー定数、RATE_LIMIT 定数（TTL=300秒、タイムアウト=5秒）、PROGRESS_BAR 設定
    ├── input.js      # stdin を読み込み JSON 文字列として返す（TTY 時は '{}' を返す）
    ├── display.js    # buildStatusOutput: ステータスライン文字列の組み立て
    ├── api.js        # fetchUsage: HTTPS GET で Anthropic OAuth 使用量 API を呼び出す
    ├── cache.js      # JSON ファイルキャッシュ（アトミック書き込み、TTL 管理）
    ├── keychain.js   # macOS security コマンドで Keychain からトークン取得
    └── rateLimit.js  # getRateLimitDisplay: キャッシュ確認 → API 呼び出し → プログレスバー付き文字列生成
```

## 表示内容

バージョン・モデル名・カレントディレクトリ名・コンテキスト使用率・5時間/7日間レート制限（プログレスバー + リセット時刻 JST）

## コマンド

```bash
# 通常実行
npm run start

# デバッグ実行（stderr にエラー詳細が出力される）
echo '{}' | DEBUG=1 node index.js

# キャッシュクリア
node clear-cache.js
```

## API

`GET https://api.anthropic.com/api/oauth/usage`（`anthropic-beta: oauth-2025-04-20` ヘッダー必須）

キャッシュファイル: `~/.claude/scripts/statusline/tmp/cc-usage-cache.json`（TTL: 300秒）
