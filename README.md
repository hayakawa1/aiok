# AIOK Next.js

クリエイターとクライアントをマッチングするサービスのNext.js実装です。

## 機能

- Google認証によるユーザー登録・ログイン
- プロフィール編集（名前、自己紹介、アバター画像）
- プランの作成・編集・削除
- 依頼の作成・管理
- Stripe Connectによる決済機能

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth.js
- Stripe

## 開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/hayakawa1/aiok-next.git
cd aiok-next
```

2. 依存パッケージをインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env.local
```
`.env.local`ファイルを編集し、必要な環境変数を設定してください。

4. データベースをセットアップ
```bash
npx prisma migrate dev
```

5. 開発サーバーを起動
```bash
npm run dev
```

## 環境変数

- `DATABASE_URL`: PostgreSQLデータベースのURL
- `NEXTAUTH_SECRET`: NextAuth.jsの秘密鍵
- `GOOGLE_CLIENT_ID`: Google OAuth クライアントID
- `GOOGLE_CLIENT_SECRET`: Google OAuth クライアントシークレット
- `STRIPE_SECRET_KEY`: Stripe シークレットキー
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook シークレット

## ライセンス

MIT
