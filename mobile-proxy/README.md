# mobile-proxy

`vibe-kanban` 本体を変更せずに、リバースプロキシでモバイル向け CSS を注入するためのディレクトリです。

## 構成

- `proxy.mjs`: HTML の `</head>` 直前に `mobile-override.css` を注入する Node.js プロキシ
- `mobile.css`: モバイル向け上書き CSS（以下を反映）
  - **Safe area**: ノッチ・ホームインジケータ用 `env(safe-area-inset-*)`、`100dvh`
  - **レイアウト**: 左 AppBar 非表示、コンテンツ全幅、カンバン列の縦積み
  - **Issue パネル**: 開時はカンバン上・パネル下の縦並び（35% / 65%）
  - **タッチ**: 最小タップ領域 44px、タップハイライト調整
  - **余白**: 768px 以下と 428px 以下で段階的にパディング縮小
- `start.sh`: 手動起動用スクリプト
- `systemd/`: systemd ユニット定義
- `Makefile`: systemd 登録/更新/確認コマンド

## 現在のポート割り当て

- `vibe-kanban` (upstream): `127.0.0.1:58081`
- `mobile-proxy` (public entry via tailscale serve): `127.0.0.1:58080`

`tailscaled` が外向きの `:58080` を受け、`localhost:58080` に転送します。

## セットアップ / 更新

`mobile-proxy` ディレクトリで実行:

```bash
npm install
make register
```

`make register` は以下を一括実行します。

1. systemd ユニットを `/etc/systemd/system` へ配置
2. `systemctl daemon-reload`
3. `vibe-kanban-mobile-proxy.service` の `enable`
4. `vibe-kanban.service` / `vibe-kanban-mobile-proxy.service` の再起動
5. 両サービスのステータス表示

## よく使うコマンド

```bash
# 状態確認
make status

# 再起動
make restart

# proxy ログ追跡
make logs

# proxy 停止/起動
make stop
make start
```

## 手動起動（systemd なし）

```bash
# Makefile から（既定: upstream 3000 → proxy 8080）
make run

# ポートを変える場合（upstream 58081 → proxy 58080）
TARGET_ORIGIN="http://127.0.0.1:58081" PORT=58080 HOST=127.0.0.1 make run
```

または `start.sh` を直接実行:

```bash
TARGET_ORIGIN="http://127.0.0.1:58081" PORT=58080 HOST=127.0.0.1 ./start.sh
```

## 動作確認

```bash
curl -sS http://127.0.0.1:58080 | rg "mobile-override.css"
curl -sS http://127.0.0.1:58080/mobile-override.css | rg "@media \\(max-width: 768px\\)"
```
