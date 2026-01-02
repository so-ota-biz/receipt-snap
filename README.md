# 経費精算向け領収書分類システム (Receipt Snap)

コンテキストとして、領収書画像のサブタイプを AI 分類し、最適な OCR API を選択するシステムを想定し、その中の一部の機能を実装しています。

## 目次

- [システム概要](#システム概要)
- [前提条件](#前提条件)
- [セットアップ手順](#セットアップ手順)
- [動作確認](#動作確認)
- [データベース確認コマンド](#データベース確認コマンド)
- [停止・クリーンアップ](#停止クリーンアップ)

---

## システム概要

本システムは、以下の機能を提供します（モック含む）：

1. **領収書画像の分類**: アップロードされた領収書画像を 5 つのサブタイプ（コンビニ、飲食店、タクシー、ホテル、その他）に分類
2. **信頼度判定**: AI 分類結果の信頼度を評価し、ユーザー確認の要否を判断
3. **OCR 読み取り**: 領収書サブタイプに応じて、OCR 読み取りを実施

### アーキテクチャ

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド API**: NestJS + TypeORM
- **データベース**: MySQL 8.4
- **モック API**: NestJS（画像分類 API シミュレーター）

---

### 実行環境

| コンポーネント   | 実行場所        | ポート |
| ---------------- | --------------- | ------ |
| フロントエンド   | ローカル端末    | 5173   |
| バックエンド API | Docker コンテナ | 3000   |
| モック API       | Docker コンテナ | 3001   |
| MySQL DB         | Docker コンテナ | 3306   |

---

## 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- **Node.js**: 18.x 以上
- **npm**: 9.x 以上
- **Docker**: 20.x 以上
- **Docker Compose**: 2.x 以上

### インストール確認

```bash
node --version    # v18.x.x 以上
npm --version     # 9.x.x 以上
docker --version  # Docker version 20.x.x 以上
docker-compose --version  # Docker Compose version v2.x.x 以上
```

---

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd receipt-snap
```

### 2. プロジェクト構造の確認

プロジェクトルートに以下のディレクトリが存在することを確認：

```
receipt-snap/
├── backend-api/          # バックエンドAPIソースコード
├── frontend/             # フロントエンドソースコード
├── mock-api/             # モックAPIソースコード
├── docker-compose.yml    # Docker構成ファイル
├── init.sql              # データベース初期化SQL
└── README.md             # このファイル
```

### 3. 環境変数ファイルの作成

#### 3-1. バックエンド API 用 `.env` ファイル

**ファイル**: `backend-api/.env`

以下の内容をコピーして `backend-api/.env` ファイルを作成してください：

```env
# ======================================
# データベース接続情報
# ======================================
DB_HOST=mysql
DB_PORT=3306
DB_USER=receipt_snap_user
DB_PASSWORD=receipt_snap_password
DB_NAME=receipt_snap_db

# ======================================
# 外部API URL
# ======================================
# モックAPI URL
EXTERNAL_API_URL=http://example.com:3001

# ======================================
# アプリケーション設定
# ======================================
NODE_ENV=development
PORT=3000

# ======================================
# ログレベル
# ======================================
LOG_LEVEL=debug
```

#### 3-2. モック API 用 `.env` ファイル

**ファイル**: `mock-api/.env`

以下の内容をコピーして `mock-api/.env` ファイルを作成してください：

```env
# ======================================
# アプリケーション設定
# ======================================
NODE_ENV=development

# ======================================
# ログレベル
# ======================================
LOG_LEVEL=debug
```

#### 3-3. フロントエンド用 `.env` ファイル

**ファイル**: `frontend/.env`

以下の内容をコピーして `frontend/.env` ファイルを作成してください：

```env
# ======================================
# バックエンドAPI URL
# ======================================
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Docker コンテナの起動

Docker Compose を使用して、MySQL、バックエンド API、モック API を起動します。

```bash
# プロジェクトルートで実行
docker-compose up -d

# ログを確認
docker-compose logs -f
```

**起動確認:**

```bash
docker-compose ps
```

以下のような出力が表示されれば OK：

```
NAME                COMMAND                  SERVICE    STATUS         PORTS
project-backend-1   "docker-entrypoint.s…"   backend    Up 10 seconds  0.0.0.0:3000->3000/tcp
project-mock-api-1  "docker-entrypoint.s…"   mock-api   Up 10 seconds  0.0.0.0:80->80/tcp
project-mysql-1     "docker-entrypoint.s…"   mysql      Up 10 seconds  0.0.0.0:3306->3306/tcp
```

**ヘルスチェック確認:**

```bash
# MySQLが起動完了するまで待つ（約10-30秒）
docker-compose ps mysql
```

`STATUS` が `Up (healthy)` になれば OK。

### 5. フロントエンドの起動（ローカル）

**新しいターミナルを開いて実行:**

```bash
# frontendディレクトリに移動
cd frontend

# 依存関係のインストール（初回のみ）
npm install

# 開発サーバーの起動
npm run dev
```

**起動確認:**

ターミナルに以下のような出力が表示されます：

```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 動作確認

### 1. バックエンド API の動作確認

```bash
# ヘルスチェックエンドポイント
curl http://localhost:3000

# 期待される出力: "Hello World!"
```

### 2. モック API の動作確認

```bash
# モックAPIのヘルスチェック
curl http://localhost:3001

# 期待される出力: "Hello World!"
```

### 3. フロントエンドの動作確認

ブラウザで以下の URL にアクセス：

[http://localhost:5173](http://localhost:5173)

領収書分類画面が表示されれば OK。

### 4. エンドツーエンドテスト

1. フロントエンド画面でファイル名をドロップダウンから選択（例: `taxi_receipt.jpg`）
2. 「アップロードして分類」ボタンをクリック
3. 分類結果が表示されることを確認
4. データベースにログが保存されることを確認（後述のコマンド参照）

---

## データベース確認コマンド

### 1. MySQL コンテナに接続

```bash
docker-compose exec mysql mysql --default-character-set=utf8mb4 -u receipt_snap_user -preceipt_snap_password receipt_snap_db
```

```bash
docker-compose exec mysql mysql -u receipt_snap_user -p
# プロンプトで: receipt_snap_password
```

### 2. テーブル一覧の確認

```bash
# MySQLコンテナ内で実行
mysql> USE receipt_snap_db;
mysql> SHOW TABLES;
```

**期待される出力:**

```
+----------------------------+
| Tables_in_receipt_snap_db  |
+----------------------------+
| ai_analysis_log            |
+----------------------------+
```

### 3. データの確認

```bash
mysql> SELECT * FROM ai_analysis_log ORDER BY id DESC LIMIT 10;
```

---

## 停止・クリーンアップ

### 1. フロントエンドの停止

フロントエンドを起動しているターミナルで `Ctrl + C` を押します。

### 2. Docker コンテナの停止

```bash
# コンテナを停止・削除（データは保持）
docker-compose down

# コンテナ、ボリューム、ネットワークを全て削除（データも削除）
docker-compose down -v
```

---

**END OF README**
