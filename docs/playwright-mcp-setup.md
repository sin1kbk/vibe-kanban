# Playwright MCP セットアップガイド

## 問題の原因

Chromium が起動しない場合、以下の原因が考えられます：

1. **システム Chrome のバージョン不整合**: Playwright MCP のデフォルトは `chrome`（システムの Google Chrome）を使用します。古いバージョンだと `--disable-field-trial-config` などのフラグをサポートせず、`error: unknown flag` が発生します。

2. **Playwright 用 Chromium が未インストール**: Playwright がバンドルする Chromium がダウンロードされていない。

## 解決方法

### 1. Cursor MCP 設定の更新

`~/.cursor/mcp.json` の Playwright 設定を以下のように変更してください：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--browser",
        "chromium",
        "--headless",
        "--no-sandbox"
      ]
    }
  }
}
```

**各オプションの説明:**
- `--browser chromium`: Playwright バンドルの Chromium を使用（システム Chrome の代わり）
- `--headless`: ヘッドレスモードで実行（ディスプレイなし環境で必須）
- `--no-sandbox`: コンテナ/Docker 等のサンドボックス環境で必要

### 2. Chromium のインストール

初回またはブラウザが見つからない場合、以下を実行：

```bash
npm install @playwright/test  # またはプロジェクトで playwright を使用している場合
npx playwright install chromium
```

または `@playwright/mcp` 経由で：

```bash
npx playwright install chromium
```

### 3. Cursor の再起動

MCP 設定を変更した後は、**Cursor を再起動**して MCP サーバーを再読み込みしてください。

## トラブルシューティング

| エラー | 対処 |
|-------|------|
| `error: unknown flag 'disable-field-trial-config'` | `--browser chromium` を使用する |
| `Executable doesn't exist` | `npx playwright install chromium` を実行 |
| ヘッドレス環境で起動しない | `--headless --no-sandbox` を追加 |
