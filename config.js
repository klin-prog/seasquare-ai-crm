/* =====================================================================
   config.js — シングル・ソース・オブ・トゥルース
   このファイルだけを書き換えれば、ブランド名・ロゴ・主要色・ログイン
   ユーザー・数値の前提（目標/実績/予測）をまとめて切り替えられます。
   ===================================================================== */
window.CONFIG = {
  brand: {
    product:  'AI×CRM Console',        // コンソール名（サイドバー1行目）
    company:  'シースクエア株式会社',   // 会社名（デモ＝顧客名。サイドバー2行目）
    short:    'シースクエア',           // <title> に使う短縮名
    logoText: 'S²',                     // サイドバーのロゴ文字（logoSvg 未設定時）
    logoSvg:  null,                     // ロゴSVG文字列を入れると logoText より優先
    primary:  '#6b5cff',               // メインブランドカラー
    secondary:'#06a89e',               // サブブランドカラー
  },

  // ログインユーザー（デモ＝顧客側の担当者）
  user: {
    name:    '三浦 慎一',
    role:    '管理者',
    email:   'miura@seasquare.co.jp',
    initial: '三',
  },

  // 数値の前提。KPI・チャート・レポートはすべてここから導出（item 6）
  finance: {
    target:    10000000,  // 月商目標
    actual:     6840000,  // 今月EC売上（実績・本日まで）
    forecast:   9200000,  // AI予測 月末着地
    momGrowth:     14.2,  // 前月比 %
    pastMonths: [480, 520, 610, 580, 640],  // 過去5ヶ月の実績（万円）
  },
};

/* hex -> rgba 文字列 */
function _hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* ブランド identity とテーマを DOM に反映（boot 時に1回呼ぶ） */
function applyBranding() {
  const b = CONFIG.brand, u = CONFIG.user, r = document.documentElement.style;

  // テーマカラー（item 3）— CONFIG.brand.primary/secondary を変えると全体が再スキン
  r.setProperty('--brand-primary', b.primary);
  r.setProperty('--brand-secondary', b.secondary);
  r.setProperty('--accent', b.primary);
  r.setProperty('--accent-hi', b.primary);
  r.setProperty('--accent-bg', _hexToRgba(b.primary, .10));
  r.setProperty('--accent-border', _hexToRgba(b.primary, .28));
  r.setProperty('--ai', b.secondary);
  r.setProperty('--ai-bg', _hexToRgba(b.secondary, .10));

  // タブ名（item 1）
  document.title = `AI×CRM 管理コンソール — ${b.short}`;

  // サイドバーのロゴ・社名（item 1, 3）
  const mark = document.querySelector('.brand-mark');
  if (mark) mark.innerHTML = b.logoSvg || b.logoText;
  const bn = document.querySelector('.brand-name'); if (bn) bn.textContent = b.product;
  const bs = document.querySelector('.brand-sub');  if (bs) bs.textContent = b.company;

  // ユーザーカード（item 2）
  const ua = document.querySelector('.user-card .avatar');    if (ua) ua.textContent = u.initial;
  const un = document.querySelector('.user-card .user-name'); if (un) un.textContent = `${u.name}（${u.role}）`;
  const ue = document.querySelector('.user-card .user-email');if (ue) ue.textContent = u.email;
}

window.applyBranding = applyBranding;
applyBranding();
