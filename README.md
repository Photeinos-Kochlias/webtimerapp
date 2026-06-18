# Web Timer

タイマー・ストップウォッチ・ポモドーロタイマーのNext.jsアプリ。

## セットアップ

```bash
npm install
npm run dev
```

## GitHub Pagesへのデプロイ

### 1. リポジトリの設定

GitHubリポジトリの **Settings → Pages** を開き:
- **Source** を `GitHub Actions` に設定

### 2. プッシュ

`main` ブランチにプッシュすると自動でビルド・デプロイされます。

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 3. サブパスでの公開（リポジトリ名がある場合）

`next.config.js` に `basePath` を追加してください:

```js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/<repo-name>',   // ← 追加
  images: { unoptimized: true },
}
```

## 技術スタック

- **Next.js 15** (App Router, Static Export)
- **TypeScript**
- **Web Audio API** (効果音)
- CSS変数によるテーマ管理
