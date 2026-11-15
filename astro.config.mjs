// Astro の設定ファイル
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap'; // Google などにページの一覧（サイトマップ）を知らせる

// GitHub で公開するときは、自動公開の設定（.github/workflows/deploy.yml）が
// リポジトリ名を REPO_NAME として渡してくれます。
//   ・リポジトリ名が「ユーザー名.github.io」 → https://ユーザー名.github.io/
//   ・それ以外（例：kurashi-keisan）       → https://ユーザー名.github.io/kurashi-keisan/
// 自分のパソコン（npm run dev）では REPO_NAME がないので、いつもどおり / で動きます。
const repo = process.env.REPO_NAME;
const owner = process.env.REPO_OWNER;
const isUserSite = repo && repo.toLowerCase().endsWith('.github.io');

export default defineConfig({
  site: owner ? `https://${owner.toLowerCase()}.github.io` : undefined,
  base: repo && !isUserSite ? `/${repo}` : '/',
  // サイトマップは公開用（GitHub）で作るときだけ出力されます
  integrations: [sitemap()],
});
