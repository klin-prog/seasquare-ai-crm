# AI×CRM 管理コンソール — シースクエア株式会社

Claude Design からの handoff バンドルをもとにした静的プロトタイプ（HTML / CSS / JS）。

## エントリポイント
- `index.html` — メインの管理コンソール（`AI-CRM Console.html` のコピー）
- `uploads/AI-CRM-admin.html` — 管理画面

## 構成
| ファイル | 役割 |
| --- | --- |
| `index.html` | 画面本体 |
| `styles.css` | スタイル |
| `data.js` | ダミーデータ |
| `app.js` / `details.js` / `interactions.js` / `icons.js` | 画面ロジック・描画 |

外部 CDN: Google Fonts, Chart.js。ビルド不要の静的サイトとして配信できます。

> 元の handoff 説明は `HANDOFF.md` を参照。
