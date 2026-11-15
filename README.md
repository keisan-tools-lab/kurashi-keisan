# くらし計算帖

犬・猫の年齢、グラム単価、割り勘、日割り、複利などの計算機を集めたサイトです（Astro製）。

## 動かし方

PowerShell で次を順番に実行します。

```powershell
cd C:\dev\kurashi-keisan
npm install      # 最初の1回だけ
npm run dev      # 開発用サーバーを起動
```

ブラウザで http://localhost:4321 を開きます。ファイルを保存すると画面が自動で更新されます。止めるときは `Ctrl + C` を押します。

## 公開用のファイルを作る

```powershell
npm run build    # dist フォルダに完成品ができる
npm run preview  # 完成品をブラウザで確認（http://localhost:4321）
```

`dist` フォルダを Netlify Drop（https://app.netlify.com/drop）にドラッグすると公開できます。

※ `dist\index.html` をダブルクリックで開くと、ページ間のリンクが動きません。確認は `npm run preview` で行ってください。

## フォルダの中身

```
src/
├─ data/tools.ts        計算機の一覧（名前・説明文・カテゴリ）
├─ layouts/Layout.astro 全ページ共通の枠（ヘッダー・フッター）
├─ components/          入力欄や結果欄などの部品
│   ├─ Field.astro       数字を入れる欄
│   ├─ Choice.astro      ボタン型の選択肢
│   ├─ Select.astro      プルダウン
│   ├─ InputCard.astro   「① 数字を入れてください」の枠
│   ├─ Result.astro      「② 計算結果」の枠
│   ├─ Answer.astro      大きく表示する答え
│   └─ ToolList.astro    計算機へのリンク一覧
├─ pages/               1ファイル = 1ページ
│   ├─ index.astro       トップページ（/）
│   ├─ pet.astro         犬・猫の年齢（/pet）
│   └─ …ほか17ページ
├─ scripts/util.ts      計算で使う共通の関数
└─ styles/global.css    サイト全体の見た目
public/favicon.svg      アイコン
```

## 計算機を1つ増やす手順

1. `src/data/tools.ts` の `tools` に1行追加します（`slug` がページのアドレスになります）。
2. `src/pages/` にある似た計算機のファイル（例：`tax.astro`）をコピーして、`slug と同じ名前.astro` で保存します。
3. ファイルの中の `<Layout slug="tax">` を新しい slug に変えます。
4. 入力欄（`<Field>` など）と、`<script>` の中の `update()` の計算を書きかえます。

トップページと「ほかの計算機」の一覧には自動で追加されます。

## 色や文字の大きさを変える

`src/styles/global.css` のいちばん上にある `:root { … }` の値を変えると、サイト全体の色が変わります。
