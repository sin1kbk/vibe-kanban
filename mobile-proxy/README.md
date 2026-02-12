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
make register
```

`make register` は以下を一括実行します。

1. **deps**: `npm install`（プロキシ用の依存関係）
2. systemd ユニットを `/etc/systemd/system` へ配置（`REPO_ROOT` を自動解決）
3. `systemctl daemon-reload`
4. `vibe-kanban.service` と `vibe-kanban-mobile-proxy.service` の **enable**
5. 両サービスの **restart**
6. 両サービスのステータス表示（**status**）

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

## リリース手順（systemd で運用する場合）

本番／検証環境で systemd 経由で vibe-kanban と mobile-proxy を動かすときの手順です。

### 前提

- リポジトリルートで **サーババイナリをビルド済み**であること（`target/release/server` が存在する）。
- 未ビルドの場合はリポジトリルートで:

  ```bash
  pnpm run build:npx
  ```

  でフロント＋Rust をビルドする（`target/release/server` ができるまで実行）。

### 初回セットアップ

1. リポジトリルートでサーバをビルド（上記のとおり）。
2. `mobile-proxy` ディレクトリへ移動し、依存関係のインストールと systemd 登録を行う:

   ```bash
   cd mobile-proxy
   make register
   ```

   `make register` は **deps**（`npm install`）→ ユニット配置 → **daemon-reload** → **enable** → **restart** → **status** まで一括で実行します。
3. `make status` で両方とも `active (running)` であることを確認。

### 更新時（コードや CSS を変えたあと）

1. **vibe-kanban 本体だけ変更した場合**  
   リポジトリルートで再ビルドし、両サービスを再起動:

   ```bash
   # リポジトリルートで
   pnpm run build:npx   # 必要に応じて
   cd mobile-proxy
   make restart
   ```

2. **mobile-proxy だけ変更した場合**（`proxy.mjs` や `mobile.css` など）  
   依存を入れ直してから proxy を再起動:

   ```bash
   cd mobile-proxy
   make deps
   make restart
   ```

3. **systemd ユニットだけ変更した場合**（`systemd/*.service` の編集）  
   ユニットを再配置してから両方再起動:

   ```bash
   cd mobile-proxy
   make register
   ```

### 注意

- ユニット内のパス（`WorkingDirectory` / `ExecStart`）は、**`make install-units` 実行時の `mobile-proxy` の親ディレクトリ**が `REPO_ROOT` として埋め込まれます。別のワークツリーやクローンで使う場合は、そのディレクトリで改めて `make register` を実行してください。
- `User=` はユニット内で `agent` になっています。別ユーザで動かす場合は `systemd/*.service` の `User=` を編集してから `make register` を実行してください。

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
