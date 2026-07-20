/* =====================================================================
   Lead Scoring Engine  ―  シースクエア 見込客スコアリング
   行動イベント × 配点ルール（時間窓つき）。配点は下記 CONFIG を変更するだけ。
   ===================================================================== */

/* --- 商品マスタ（関心商品の名称解決に使用） --- */
window.PRODUCTS = {
  'SOFA-001':    'モダンコーナーソファ',
  'TABLE-001':   'ナチュラルウッド ダイニングT',
  'LAMP-001':    'デザインフロアランプ',
  'RUG-001':     'オーガニックコットン ラグ',
  'CHAIR-001':   '北欧ダイニングチェア',
  'LAMP-002':    'ペンダントライト ガラス',
  'CURTAIN-001': 'リネンカーテン アイボリー',
  'TABLE-002':   'スカンジ サイドテーブル',
};

/* --- 配点ルール（★ここを変えるだけで再計算される） --- */
window.SCORING = {
  asOf: '2026-05-20',        // 基準日
  windowMonths: 2,           // 時間窓（この期間外のイベントは加点しない）
  cutoffMonths: 3,           // 足切り：直近この期間に有効行動ゼロならスコア対象外
  totalCap: 100,             // 合計スコアの頭打ち
  bands: { hot: 80, warm: 40 },   // ホット>=80 / ウォーム>=40 / コールド<40

  // perTime=true: points×回数（capで頭打ち） / perTime=false: 1回でも発生すれば points（フラット）
  config: {
    ar:      { label:'AR体験',                points:30, cap:30, perTime:false, color:'#6b5cff' },
    cart:    { label:'カート投入',            points:25, cap:25, perTime:false, color:'#06a89e' },
    abandon: { label:'カゴ落ち',              points:15, cap:15, perTime:false, color:'#d97706' },
    fav:     { label:'お気に入り・マイルーム', points:15, cap:15, perTime:false, color:'#2563eb' },
    click:   { label:'メールクリック',        points:8,  cap:24, perTime:true,  color:'#16a34a' },
    view:    { label:'商品詳細 閲覧',         points:5,  cap:30, perTime:true,  color:'#94a3b8' },
    open:    { label:'メール開封',            points:2,  cap:10, perTime:true,  color:'#c4b5fd' },
  },
};

/* --- スコア帯判定 --- */
function scoreBand(s) {
  const b = SCORING.bands;
  if (s >= b.hot)  return { key:'hot',  label:'ホット',   cls:'b-danger',  color:'var(--danger)' };
  if (s >= b.warm) return { key:'warm', label:'ウォーム', cls:'b-warn',    color:'var(--warn)' };
  return              { key:'cold', label:'コールド', cls:'b-info',    color:'var(--info)' };
}
window.scoreBand = scoreBand;

/* --- 1顧客のスコア計算 --- */
function computeLeadScore(cust, opts) {
  opts = opts || {};
  const asOf = new Date((opts.asOf || SCORING.asOf) + 'T00:00:00');
  const months = opts.windowMonths != null ? opts.windowMonths : SCORING.windowMonths;
  const cutoffM = opts.cutoffMonths != null ? opts.cutoffMonths : SCORING.cutoffMonths;
  const cutoff = new Date(asOf); cutoff.setMonth(cutoff.getMonth() - months);
  const eligCut = new Date(asOf); eligCut.setMonth(eligCut.getMonth() - cutoffM);
  const cfg = SCORING.config;

  // イベント展開（daysAgo → 実日付）
  const events = (cust.ev || []).map(([type, sku, daysAgo]) => {
    const d = new Date(asOf); d.setDate(d.getDate() - daysAgo);
    return { type, sku, product: PRODUCTS[sku], date: d, daysAgo, inWindow: d >= cutoff };
  }).sort((a, b) => b.date - a.date);

  const inWin = events.filter(e => e.inWindow);
  // 足切り：直近 cutoffM ヶ月に有効行動が1件もなければ対象外
  const eligible = events.some(e => e.date >= eligCut);

  // 種別ごとの寄与
  const byType = {};
  inWin.forEach(e => { (byType[e.type] = byType[e.type] || []).push(e); });

  const breakdown = [];
  let raw = 0;
  Object.keys(cfg).forEach(type => {
    const list = byType[type];
    if (!list || !list.length) return;
    const c = cfg[type];
    const count = list.length;
    const pts = c.perTime ? Math.min(count * c.points, c.cap) : c.points;
    raw += pts;
    const pc = {};
    list.forEach(e => { pc[e.sku] = (pc[e.sku]||0) + 1; });
    const topSku = Object.entries(pc).sort((a,b)=>b[1]-a[1])[0][0];
    breakdown.push({ type, label: c.label, count, points: pts, color: c.color,
                     perTime: c.perTime, unit: c.points, cap: c.cap,
                     sku: topSku, product: PRODUCTS[topSku],
                     skus: [...new Set(list.map(e=>e.sku))] });
  });
  breakdown.sort((a, b) => b.points - a.points);

  const total = eligible ? Math.min(raw, SCORING.totalCap) : 0;
  const capped = raw > SCORING.totalCap;

  // 最も寄与した商品
  const prodPts = {};
  inWin.forEach(e => { prodPts[e.sku] = (prodPts[e.sku] || 0) + cfg[e.type].points; });
  let topSku = null, topVal = -1;
  Object.entries(prodPts).forEach(([sku, v]) => { if (v > topVal) { topVal = v; topSku = sku; } });

  const lastInWin = inWin.length ? inWin[0].date : null;
  const lastAny = events.length ? events[0].date : null;

  return {
    total, raw, capped, breakdown, eligible,
    topSku, topProduct: topSku ? PRODUCTS[topSku] : null,
    events, inWin,
    lastInWin, lastAny,
    outOfWindowCount: events.length - inWin.length,
    band: eligible ? scoreBand(total) : { key:'excluded', label:'対象外', cls:'b-neutral', color:'var(--text-mute)' },
  };
}
window.computeLeadScore = computeLeadScore;

/* --- 全リードを計算して行データ化（データ連携 IF 経由） --- */
function computeLeadRows(opts) {
  return LeadDataSource.listLeads().map(c => {
    const sc = computeLeadScore(c, opts);
    return { ...c, ...sc };
  }).sort((a, b) => b.total - a.total);
}
window.computeLeadRows = computeLeadRows;

/* =====================================================================
   データ連携の抽象化（モック IF）
   ── 実 API（仕様未定）はここを差し替えるだけで対応可能。
   会員ID取得 / 購買履歴取得 / ユーザーID紐付けを仮実装。
   ===================================================================== */
window.LeadDataSource = {
  _source: 'mock',   // 'mock' | 'api'
  listLeads() { return window.LEAD_CUSTOMERS || []; },                 // 将来: GET /api/leads
  memberId(c) { return c.group === 'A' ? c.id : null; },               // 会員ID（A）
  browserId(c) { return c.group === 'B' ? c.id : null; },              // ブラウザ識別子（B）
  resolveUserId(c) { return c.id; },                                   // ブラウザ→会員の同一人紐付け
  purchases(c) { return (window.PURCHASES || []).filter(p => p.userId === c.id); }, // GET /api/purchases
};

/* =====================================================================
   効果測定：スコア → 実購買の突合器
   ===================================================================== */
window.PURCHASES = [
  { userId:'MEM-10231', sku:'SOFA-001',  amount:189000, date:'2026-05-19' },
  { userId:'MEM-10188', sku:'TABLE-001', amount:128000, date:'2026-05-18' },
  { userId:'MEM-10442', sku:'RUG-001',   amount:24500,  date:'2026-05-17' },
  { userId:'MEM-10077', sku:'LAMP-002',  amount:22000,  date:'2026-05-16' },
  { userId:'BR-8f3a91c',sku:'LAMP-002',  amount:22000,  date:'2026-05-15' },
  { userId:'BR-2c7d40e',sku:'SOFA-001',  amount:189000, date:'2026-05-14' },
  { userId:'MEM-10310', sku:'TABLE-001', amount:128000, date:'2026-05-12' },
  { userId:'MEM-10501', sku:'CHAIR-001', amount:18000,  date:'2026-05-10' },
];

function reconcileScoreToPurchase(opts) {
  const rows = computeLeadRows(opts).filter(r => r.eligible);
  const bands = [['hot','ホット','var(--danger)'], ['warm','ウォーム','var(--warn)'], ['cold','コール','var(--info)']];
  return bands.map(([key, label, color]) => {
    const grp = rows.filter(r => r.band.key === key);
    const buyers = grp.filter(r => LeadDataSource.purchases(r).length > 0);
    const rev = buyers.reduce((s, r) => s + LeadDataSource.purchases(r).reduce((a, p) => a + p.amount, 0), 0);
    return { key, label, color, leads: grp.length, buyers: buyers.length,
             cvr: grp.length ? buyers.length / grp.length : 0, rev };
  });
}
window.reconcileScoreToPurchase = reconcileScoreToPurchase;

/* =====================================================================
   モックデータ  ―  A:会員 / B:メール非会員 の混在（24件）
   ev: [種別, 商品SKU, 何日前]  ※60日より前 = 時間窓(2ヶ月)の外
   ===================================================================== */
window.LEAD_CUSTOMERS = [
  /* ---------- グループ A：会員（会員ID・氏名・購買履歴あり） ---------- */
  { group:'A', id:'MEM-10231', name:'佐藤 美咲',   email:'misaki.sato@example.jp',   optIn:true,  seg:'リピート', orders:6,
    ev:[['ar','SOFA-001',3],['cart','SOFA-001',2],['fav','SOFA-001',4],['view','SOFA-001',3],['view','SOFA-001',5],['view','SOFA-001',8],['open','SOFA-001',6],['open','RUG-001',12]] },

  { group:'A', id:'MEM-10188', name:'中村 健太郎', email:'nakamura@example.jp',      optIn:true,  seg:'VIP', orders:18,
    ev:[['cart','TABLE-001',1],['view','TABLE-001',1],['view','TABLE-001',2],['view','TABLE-001',4],['view','TABLE-001',10],['fav','TABLE-001',2],['click','TABLE-001',2],['click','TABLE-001',3],['open','TABLE-001',5],['open','CHAIR-001',9],['open','CHAIR-001',14]] },

  { group:'A', id:'MEM-10442', name:'山本 葵',     email:'aoi.y@example.jp',         optIn:true,  seg:'VIP', orders:11,
    ev:[['ar','RUG-001',5],['fav','RUG-001',2],['abandon','RUG-001',6],['view','RUG-001',2],['view','RUG-001',4],['view','RUG-001',7],['view','CURTAIN-001',9],['view','RUG-001',15]] },

  { group:'A', id:'MEM-10077', name:'木村 拓也',   email:'kimura.t@example.jp',      optIn:true,  seg:'VIP', orders:9,
    ev:[['cart','LAMP-002',2],['ar','LAMP-002',3],['fav','LAMP-002',4],['view','LAMP-002',2],['view','LAMP-002',5],['click','LAMP-002',3],['click','LAMP-002',6],['open','LAMP-002',7]] },

  { group:'A', id:'MEM-10310', name:'田中 健一',   email:'tanaka.k@example.jp',      optIn:true,  seg:'新規', orders:1,
    ev:[['fav','TABLE-001',5],['view','TABLE-001',5],['view','TABLE-001',9],['view','CHAIR-001',11],['view','TABLE-001',18],['open','TABLE-001',4],['open','TABLE-001',7],['open','TABLE-001',12],['open','CHAIR-001',20],['open','CHAIR-001',25],['click','TABLE-001',6]] },

  { group:'A', id:'MEM-10501', name:'小林 由美',   email:'kobayashi.y@example.jp',   optIn:true,  seg:'リピート', orders:3,
    ev:[['fav','CHAIR-001',6],['view','CHAIR-001',6],['view','CHAIR-001',10],['view','CHAIR-001',13],['view','TABLE-002',16],['view','CHAIR-001',22],['open','CHAIR-001',8],['open','CHAIR-001',15],['open','CHAIR-001',19],['open','TABLE-002',24],['open','TABLE-002',30]] },

  { group:'A', id:'MEM-10225', name:'山口 凛',     email:'rin.y@example.jp',         optIn:true,  seg:'リピート', orders:7,
    ev:[['fav','LAMP-001',7],['view','LAMP-001',7],['view','LAMP-001',12],['view','LAMP-001',20],['view','LAMP-001',28],['click','LAMP-001',9],['open','LAMP-001',10],['open','LAMP-001',18],['open','LAMP-001',26],['open','RUG-001',33],['open','RUG-001',40]] },

  { group:'A', id:'MEM-10618', name:'井上 樹',     email:'inoue.i@example.jp',       optIn:true,  seg:'リピート', orders:4,
    ev:[['fav','CURTAIN-001',9],['view','CURTAIN-001',9],['view','CURTAIN-001',15],['view','CURTAIN-001',24],['view','RUG-001',35],['open','CURTAIN-001',12],['open','CURTAIN-001',22],['open','CURTAIN-001',38]] },

  { group:'A', id:'MEM-10390', name:'高橋 真理',   email:'mari.t@example.jp',        optIn:true,  seg:'休眠', orders:3,
    ev:[['cart','RUG-001',12],['abandon','RUG-001',12],['view','RUG-001',12],['view','RUG-001',20],['open','RUG-001',18],['open','CURTAIN-001',44]] },

  { group:'A', id:'MEM-10733', name:'渡辺 さくら', email:'sakura.w@example.jp',      optIn:true,  seg:'リピート', orders:4,
    ev:[['fav','RUG-001',14],['view','RUG-001',14],['view','RUG-001',26],['view','TABLE-002',33],['view','RUG-001',48],['click','RUG-001',16]] },

  { group:'A', id:'MEM-10812', name:'伊藤 拓海',   email:'takumi.i@example.jp',      optIn:true,  seg:'新規', orders:0,
    ev:[['ar','LAMP-001',20],['view','LAMP-001',20],['view','LAMP-001',30],['view','LAMP-001',45],['open','LAMP-001',25]] },

  { group:'A', id:'MEM-10555', name:'鈴木 大輔',   email:'daisuke.s@example.jp',     optIn:true,  seg:'新規', orders:0,
    ev:[['view','SOFA-001',9],['view','SOFA-001',13],['view','SOFA-001',18],['view','SOFA-001',24],['view','SOFA-001',31],['view','SOFA-001',40],['click','SOFA-001',11],['open','SOFA-001',12],['open','SOFA-001',22]] },

  { group:'A', id:'MEM-10904', name:'加藤 翔',     email:'sho.k@example.jp',         optIn:false, seg:'休眠', orders:1,
    /* 直近は薄いがカゴ落ち・ARは窓の外＝スコアに含まれない（デモ用） */
    ev:[['view','TABLE-001',22],['view','TABLE-001',40],['open','TABLE-001',30],['cart','TABLE-001',95],['abandon','TABLE-001',95],['ar','TABLE-001',120]] },

  { group:'A', id:'MEM-11020', name:'吉田 ありさ', email:'arisa.y@example.jp',       optIn:true,  seg:'新規', orders:0,
    ev:[['view','CURTAIN-001',18],['open','CURTAIN-001',20],['open','CURTAIN-001',33],['open','CURTAIN-001',47]] },

  { group:'A', id:'MEM-11133', name:'松本 花',     email:'hana.m@example.jp',        optIn:true,  seg:'新規', orders:0,
    ev:[['view','CHAIR-001',26],['open','CHAIR-001',28],['open','CHAIR-001',35],['open','TABLE-002',42],['open','TABLE-002',50]] },

  { group:'A', id:'MEM-11207', name:'清水 恵',     email:'megumi.s@example.jp',      optIn:false, seg:'休眠', orders:2,
    /* 大きな行動はすべて窓の外 */
    ev:[['view','RUG-001',34],['view','RUG-001',52],['open','RUG-001',40],['ar','RUG-001',88],['cart','RUG-001',96]] },

  /* ---------- グループ B：メール非会員（氏名なし・ブラウザ識別子・購買履歴なし） ---------- */
  { group:'B', id:'BR-8f3a91c', name:null, email:'guest_8f3a@track.example.jp', optIn:true, seg:null, orders:null,
    ev:[['ar','LAMP-002',2],['cart','LAMP-002',3],['abandon','LAMP-002',3],['view','LAMP-002',2],['view','LAMP-002',4],['view','LAMP-002',6],['view','LAMP-002',9]] },

  { group:'B', id:'BR-2c7d40e', name:null, email:'guest_2c7d@track.example.jp', optIn:true, seg:null, orders:null,
    ev:[['ar','SOFA-001',4],['cart','SOFA-001',5],['abandon','SOFA-001',5],['view','SOFA-001',4],['view','SOFA-001',7],['view','SOFA-001',11]] },

  { group:'B', id:'BR-5a1e88b', name:null, email:'guest_5a1e@track.example.jp', optIn:false, seg:null, orders:null,
    ev:[['fav','RUG-001',10],['view','RUG-001',10],['view','RUG-001',14],['view','RUG-001',19],['click','RUG-001',12],['open','RUG-001',13]] },

  { group:'B', id:'BR-9b6c22f', name:null, email:'guest_9b6c@track.example.jp', optIn:true, seg:null, orders:null,
    ev:[['cart','TABLE-002',8],['view','TABLE-002',8],['view','TABLE-002',15],['open','TABLE-002',10],['open','TABLE-002',18],['open','TABLE-002',27]] },

  { group:'B', id:'BR-1d4f70a', name:null, email:'guest_1d4f@track.example.jp', optIn:false, seg:null, orders:null,
    ev:[['view','CHAIR-001',16],['view','CHAIR-001',24],['open','CHAIR-001',20]] },

  { group:'B', id:'BR-6e2a55d', name:null, email:'guest_6e2a@track.example.jp', optIn:true, seg:null, orders:null,
    ev:[['view','LAMP-001',30],['open','LAMP-001',33],['ar','LAMP-001',140]] /* AR は窓外 */ },

  { group:'B', id:'BR-3f8b19c', name:null, email:'guest_3f8b@track.example.jp', optIn:false, seg:null, orders:null,
    ev:[['view','CURTAIN-001',38]] },

  { group:'B', id:'BR-7c0d63e', name:null, email:'guest_7c0d@track.example.jp', optIn:true, seg:null, orders:null,
    ev:[['view','SOFA-001',44],['view','SOFA-001',55],['open','SOFA-001',48],['cart','SOFA-001',150]] /* cart は窓外 */ },

  /* ---------- 足切り対象外（直近3ヶ月に有効行動なし＝スコア対象外） ---------- */
  { group:'A', id:'MEM-10466', name:'橋本 直人', email:'hashimoto.n@example.jp', optIn:true, seg:'休眠', orders:2,
    ev:[['view','SOFA-001',110],['open','SOFA-001',120],['cart','SOFA-001',135]] },

  { group:'B', id:'BR-4a9e12b', name:null, email:'guest_4a9e@track.example.jp', optIn:false, seg:null, orders:null,
    ev:[['view','RUG-001',130],['open','RUG-001',145]] },
];

/* data.js の旧 LEADS を上書き（互換のため） */
if (window.DATA) window.DATA.LEADS = window.LEAD_CUSTOMERS;
