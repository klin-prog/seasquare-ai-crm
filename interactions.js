/* ===== Generic drawer / modal / confirm ===== */
const DRAWER = {
  open(title, body, width = 480) {
    const d = $('#drawer');
    d.style.width = width + 'px';
    $('#drawer-title').innerHTML = title;
    $('#drawer-body').innerHTML = body;
    d.classList.add('open');
    $('#drawer-backdrop').classList.add('open');
  },
  close() {
    $('#drawer').classList.remove('open');
    $('#drawer-backdrop').classList.remove('open');
  },
};
window.closeDrawer = () => DRAWER.close();

function confirmDialog({title, body, confirmText='実行', cancelText='キャンセル', onConfirm, kind='primary'}) {
  const back = document.createElement('div');
  back.className = 'drawer-backdrop open';
  back.style.zIndex = 80;
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:420px;background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;z-index:90;box-shadow:0 24px 60px rgba(20,21,42,.18);overflow:hidden';
  m.innerHTML = `
    <div style="padding:18px 20px;border-bottom:1px solid var(--border)">
      <div style="font-size:14px;font-weight:600">${title}</div>
    </div>
    <div style="padding:18px 20px;font-size:13px;color:var(--text-soft);line-height:1.6">${body}</div>
    <div style="padding:14px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:#fafbfd">
      <button class="btn" id="__cf_cancel">${cancelText}</button>
      <button class="btn ${kind}" id="__cf_ok">${confirmText}</button>
    </div>
  `;
  document.body.append(back, m);
  const cleanup = () => { back.remove(); m.remove(); };
  back.onclick = cleanup;
  m.querySelector('#__cf_cancel').onclick = cleanup;
  m.querySelector('#__cf_ok').onclick = () => { cleanup(); onConfirm && onConfirm(); };
}
window.confirmDialog = confirmDialog;

/* ===== Section helpers ===== */
const SecLabel = txt => `<div style="font-size:10.5px;letter-spacing:.06em;color:var(--text-mute);text-transform:uppercase;margin:18px 0 10px;font-weight:600">${txt}</div>`;
const Field = (l, v) => `<div><div style="font-size:11px;color:var(--text-mute);margin-bottom:3px">${l}</div><div style="font-size:13px;font-weight:500">${v}</div></div>`;
const Grid2 = (children) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${children}</div>`;
const Grid4 = (children) => `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${children}</div>`;
const Tile = (l, v, c='') => `<div class="tile"><div class="lab">${l}</div><div class="val" ${c?`style="color:${c}"`:''}>${v}</div></div>`;
const Timeline = (items) => `<div style="display:flex;flex-direction:column;gap:0">${items.map((t,i)=>`
  <div style="display:flex;gap:14px;align-items:flex-start;padding:8px 0">
    <div style="display:flex;flex-direction:column;align-items:center;width:14px;flex-shrink:0">
      <div style="width:8px;height:8px;border-radius:50%;background:${t.done?'var(--success)':t.active?'var(--accent)':'var(--border)'};${t.active?'box-shadow:0 0 0 4px var(--accent-bg)':''}"></div>
      ${i<items.length-1 ? `<div style="width:1px;flex:1;background:var(--border);margin-top:4px;min-height:24px"></div>` : ''}
    </div>
    <div style="flex:1;padding-bottom:8px">
      <div style="font-size:12.5px;font-weight:${t.active?600:500};color:${t.done||t.active?'var(--text)':'var(--text-mute)'}">${t.label}</div>
      ${t.time ? `<div style="font-size:11px;color:var(--text-mute);margin-top:2px">${t.time}</div>`:''}
    </div>
  </div>
`).join('')}</div>`;
const Actions = (btns) => `<div style="display:grid;grid-template-columns:repeat(${btns.length},1fr);gap:8px;margin-top:18px">${btns.map(b=>`<button class="btn ${b.kind||''}" onclick="${b.onclick||''}" style="justify-content:center">${b.label}</button>`).join('')}</div>`;

/* ===== Detail renderers ===== */
function openCustomer(id) {
  const c = DATA.CUSTOMERS.find(x => x.id === id);
  if (!c) return;
  DRAWER.open(`<div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:28px;height:28px;font-size:11px">${c.name[0]}</div><span>${c.name}</span></div>`, `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div class="cell-mono">${c.id}</div>
      ${segBadge(c.seg)}
    </div>
    ${Grid4(
      Tile('AI スコア', c.score, 'var(--accent-hi)') +
      Tile('LTV 予測', yen(c.ltv)) +
      Tile('累計購入', c.count+' 回') +
      Tile('チャネル', c.ch)
    )}
    ${SecLabel('直近の行動')}
    <div style="font-size:12.5px;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;gap:10px"><span class="cell-mono">5/19 21:30</span><span>ソファ詳細を閲覧（3回目）</span></div>
      <div style="display:flex;gap:10px"><span class="cell-mono">5/19 21:24</span><span>AR で部屋に試し置き</span></div>
      <div style="display:flex;gap:10px"><span class="cell-mono">5/19 21:18</span><span>お気に入りに追加</span></div>
      <div style="display:flex;gap:10px"><span class="cell-mono">5/18 14:02</span><span>トップページを訪問</span></div>
      <div style="display:flex;gap:10px"><span class="cell-mono">${c.last}</span><span>前回購入</span></div>
    </div>
    ${SecLabel('AI 推奨アクション')}
    <div class="insight" style="padding:14px">
      <div class="insight-ic">${Icon('sparkles',16)}</div>
      <div>
        <h4 style="font-size:13px">AR 体験リンクを LINE 送付</h4>
        <p style="font-size:12px">スコア急上昇 + カート保留状態。CV 見込み 82%。送信目安: 本日 18 時。</p>
      </div>
    </div>
    <button class="btn primary lg" style="width:100%;justify-content:center;margin-top:10px" onclick="confirmDialog({title:'AI アクションを実行',body:'${c.name}さまへ AR 体験リンクを LINE 送付します。',confirmText:'承認・実行',onConfirm:()=>{toast('${c.name}さまへ LINE 送付しました');closeDrawer();}})">承認して実行</button>
    ${Actions([
      {label: Icon('mail',13)+' メール', onclick:`toast('メーラーを起動')`},
      {label: Icon('line',13)+' LINE', onclick:`toast('LINE トーク開く')`},
      {label: Icon('phone',13)+' 電話', onclick:`toast('発信')`},
    ])}
  `);
}

function openLead(id) {
  const cust = (window.LEAD_CUSTOMERS || []).find(x => x.id === id);
  if (!cust) return;
  const r = computeLeadScore(cust, { windowMonths: (window.LEAD_WINDOW || 2) });
  const cfg = SCORING.config;
  const fmtDate = d => `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;

  const evTypeLabel = { view:'閲覧', open:'開封', click:'クリック', fav:'お気に入り', ar:'AR体験', cart:'カート投入', abandon:'カゴ落ち' };

  const title = cust.name
    ? `<div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:28px;height:28px;font-size:11px">${cust.name[0]}</div><span>${cust.name}</span><span class="badge b-accent" style="margin-left:4px">A 会員</span></div>`
    : `<div style="display:flex;align-items:center;gap:10px"><div style="width:28px;height:28px;border-radius:50%;background:var(--surface-2);display:grid;place-items:center;color:var(--text-mute)">${Icon('user',14)}</div><span style="color:var(--text-mute)">匿名（未登録）</span><span class="badge b-neutral" style="margin-left:4px">B 非会員</span></div>`;

  // Score breakdown rows
  const breakdownHTML = r.breakdown.length ? r.breakdown.map(b => `
    <div style="display:flex;align-items:center;gap:10px;padding:7px 0">
      <span style="width:8px;height:8px;border-radius:2px;background:${b.color};flex-shrink:0"></span>
      <span style="flex:1;font-size:12.5px">${b.label}
        <span style="color:var(--text-mute);font-size:11px">${b.perTime?`${b.count}回 × ${b.unit}点${b.count*b.unit>b.cap?` (上限${b.cap})`:''}`:`発生 1（${b.unit}点固定）`}</span>
      </span>
      <span style="width:52px;text-align:right;font-weight:700;font-size:13px">+${b.points}</span>
      <span style="width:70px;display:flex;height:6px;border-radius:4px;background:var(--surface-2);overflow:hidden"><span style="width:${b.points}%;background:${b.color}"></span></span>
    </div>
  `).join('') : `<div style="color:var(--text-mute);font-size:12.5px;padding:8px 0">時間窓内に加点対象イベントがありません</div>`;

  // Event log (in + out of window)
  const evHTML = r.events.map(e => `
    <div style="display:grid;grid-template-columns:88px 84px 1fr;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-soft);font-size:12px;${e.inWindow?'':'opacity:.45'}">
      <span class="cell-mono" style="font-size:11px">${fmtDate(e.date)}</span>
      <span><span class="badge" style="background:${cfg[e.type].color}22;color:${cfg[e.type].color};border:1px solid ${cfg[e.type].color}44">${evTypeLabel[e.type]}</span></span>
      <span style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span>${PRODUCTS[e.sku]}</span>
        ${e.inWindow ? '' : '<span style="font-size:10px;color:var(--text-mute)">窓外・除外</span>'}
      </span>
    </div>
  `).join('');

  DRAWER.open(title, `
    <div class="tile" style="margin-bottom:10px"><div class="lab">スコア（合計 / 上限 ${SCORING.totalCap}）</div><div class="val" style="color:${r.band.color}">${r.total}<span style="font-size:14px;color:var(--text-mute);font-weight:500"> / ${SCORING.totalCap}</span> <span class="badge ${r.band.cls}" style="vertical-align:middle;margin-left:8px">${r.band.label}</span></div></div>
    ${Grid2(
      Tile('関心商品', r.topProduct || '—') +
      Tile('最終行動日', r.lastInWin ? fmtDate(r.lastInWin) : '—')
    )}

    ${SecLabel(`スコア内訳（時間窓：直近${(window.LEAD_WINDOW||2)}ヶ月）`)}
    <div style="background:#fafbfd;border:1px solid var(--border);border-radius:10px;padding:12px 16px">
      ${breakdownHTML}
      ${r.capped ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border);font-size:11.5px;color:var(--warn)">素点 ${r.raw} 点 → 合計上限 ${SCORING.totalCap} 点で頭打ち</div>` : ''}
    </div>

    ${SecLabel('顧客情報')}
    <div style="background:#fafbfd;border:1px solid var(--border);border-radius:10px;padding:14px">
      ${Grid2(
        Field('グループ', cust.group==='A'?'A：会員':'B：メール非会員') +
        Field('識別子', `<span class="cell-mono">${cust.id}</span>`) +
        Field('メール', `${cust.email} ${cust.optIn?'<span class="badge b-success" style="margin-left:4px">配信可</span>':'<span class="badge b-neutral" style="margin-left:4px">配信不可</span>'}`) +
        Field('購買履歴', cust.orders==null ? '<span style="color:var(--text-mute)">なし（未購入）</span>' : `${cust.orders} 回`)
      )}
    </div>

    ${SecLabel(`行動イベント履歴（全 ${r.events.length} 件 / 窓内 ${r.inWin.length} 件${r.outOfWindowCount?` ・ 窓外 ${r.outOfWindowCount} 件は除外` : ''}）`)}
    <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:4px 16px 8px">
      ${evHTML}
    </div>
    <div style="font-size:11px;color:var(--text-mute);margin-top:8px;line-height:1.5">
      ※ スコアは <b>行動イベント × 配点ルール</b> による自動算出です。時間窓の外のイベントは加点されません（配信・アプローチはデモ対象外）。
    </div>
  `, 520);
}

function openTask(id) {
  const t = DATA.TASKS.find(x => x.id === id);
  if (!t) return;
  DRAWER.open(`タスク #${t.id}`, `
    <div style="font-size:15px;font-weight:600;margin-bottom:14px;line-height:1.4">${t.title}</div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      ${priorityChip(t.priority)}
      ${t.source==='AI' ? `<span class="badge b-ai">${Icon('sparkles',10)} AI 生成</span>` : `<span class="badge b-neutral">手動</span>`}
    </div>
    ${Grid2(
      Field('期限', `${Icon('clock',12)} ${t.due}`) +
      Field('担当者', '梶原')
    )}
    ${t.customer!=='-' ? `${SecLabel('関連顧客')}<div style="background:#fafbfd;padding:12px;border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;gap:10px"><div class="avatar" style="width:28px;height:28px;font-size:11px">${t.customer[0]}</div><span style="font-weight:500">${t.customer}</span></div>`:''}
    ${t.source==='AI' ? `${SecLabel('AI 生成根拠')}<div style="background:var(--accent-bg);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;padding:12px 14px;font-size:12.5px">${t.reason}</div>`:''}
    ${SecLabel('進行ステータス')}
    ${Timeline([
      {label:'タスク受信', time:'09:30', done:true},
      {label:'未対応', active:true},
      {label:'対応中'},
      {label:'完了'},
    ])}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="toast('タスクを保留');closeDrawer()">保留</button>
      <button class="btn primary" onclick="toast('タスク完了');closeDrawer()" style="justify-content:center">${Icon('check',13)} 完了にする</button>
    </div>
  `);
}

function openOrder(no) {
  const o = DATA.ORDERS.find(x => x.no === no);
  if (!o) return;
  const steps = ['新規','出荷準備中','出荷済','配送完了'];
  const cur = steps.indexOf(o.status);
  DRAWER.open(`注文 ${o.no}`, `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div style="font-size:22px;font-weight:600">${yen(o.amt)}</div>
      ${statusBadge(o.status)}
    </div>
    ${Grid2(
      Field('顧客', o.customer) +
      Field('日時', o.dt) +
      Field('商品', o.item) +
      Field('支払方法', o.pay)
    )}
    ${o.ai ? `<div style="margin-top:14px;padding:10px 12px;background:var(--ai-bg);border:1px solid rgba(6,168,158,.2);border-radius:10px;font-size:12px;color:var(--ai);display:flex;align-items:center;gap:8px">${Icon('sparkles',13)} AI 接客経由で発生した注文です</div>`:''}
    ${SecLabel('配送ステータス')}
    ${o.status==='キャンセル'
      ? `<div style="padding:14px;background:var(--surface-2);border-radius:10px;color:var(--text-mute);font-size:12.5px">この注文はキャンセルされました</div>`
      : Timeline(steps.map((s,i)=>({label:s,time:i<=cur?'05/'+(20-Math.max(0,cur-i))+' '+(10+i)+':30':null,done:i<cur,active:i===cur})))}
    ${SecLabel('注文内訳')}
    <table style="width:100%;font-size:12.5px">
      <tr><td style="padding:6px 0">${o.item}</td><td style="text-align:right;font-weight:500">${yen(o.amt)}</td></tr>
      <tr style="color:var(--text-mute)"><td style="padding:6px 0">送料</td><td style="text-align:right">無料</td></tr>
      <tr style="border-top:1px solid var(--border)"><td style="padding:8px 0;font-weight:600">合計</td><td style="text-align:right;font-weight:700">${yen(o.amt)}</td></tr>
    </table>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="toast('伝票を印刷')">伝票印刷</button>
      <button class="btn primary" onclick="toast('追跡情報を表示')" style="justify-content:center">${Icon('truck',13)} 配送追跡</button>
    </div>
  `);
}

function openProduct(sku) {
  const p = DATA.INVENTORY.find(x => x.sku === sku);
  if (!p) return;
  const stockPct = Math.min(100, p.stock * 2);
  const stockColor = p.stock<5 ? 'var(--danger)' : p.stock<10 ? 'var(--warn)' : 'var(--success)';
  DRAWER.open(`商品 ${p.sku}`, `
    <div style="font-size:15px;font-weight:600;margin-bottom:4px">${p.name}</div>
    <div style="font-size:12px;color:var(--text-mute);margin-bottom:14px">${p.cat}</div>
    <div style="background:linear-gradient(135deg,rgba(107,92,255,.04),rgba(6,168,158,.04));border:1px dashed var(--border);border-radius:10px;height:180px;display:grid;place-items:center;color:var(--text-mute);font-size:12px;margin-bottom:14px">商品画像プレースホルダー</div>
    ${Grid4(
      Tile('価格', '¥'+(p.price/1000)+'K') +
      Tile('在庫', p.stock+' 点', stockColor) +
      Tile('月間閲覧', p.views) +
      Tile('CVR', p.cvr)
    )}
    ${SecLabel('在庫レベル')}
    <div style="background:#fafbfd;padding:12px 14px;border-radius:10px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:12px;color:var(--text-mute)">現在の在庫</span><span style="font-weight:600;color:${stockColor}">${p.stock} 点</span></div>
      <div style="height:6px;background:var(--surface-2);border-radius:999px;overflow:hidden"><div style="height:100%;width:${stockPct}%;background:${stockColor};border-radius:999px"></div></div>
    </div>
    ${SecLabel('対応コンテンツ')}
    <div style="display:flex;gap:8px"><span class="badge b-accent">${p.ar}</span></div>
    ${p.advice!=='-' ? `${SecLabel('AI 推奨')}<div class="insight" style="padding:14px"><div class="insight-ic">${Icon('lightbulb',16)}</div><div><h4 style="font-size:13px">${p.advice}</h4><p style="font-size:12px">直近 7 日の閲覧+88%。在庫切迫リスクあり。発注ロット 20 点を推奨。</p></div></div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="toast('編集モード')" style="justify-content:center">${Icon('edit',13)} 編集</button>
      <button class="btn primary" onclick="confirmDialog({title:'発注書を作成',body:'${p.name} の発注書を AI が下書きします。',confirmText:'下書きを作成',onConfirm:()=>{toast('発注書ドラフトを作成');closeDrawer()}})" style="justify-content:center">${Icon('package',13)} 発注</button>
    </div>
  `);
}

function openCampaign(name) {
  const c = DATA.CAMPAIGNS.find(x => x.name === name);
  if (!c) return;
  const isLive = c.status === '配信中';
  DRAWER.open(`キャンペーン`, `
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">${c.name}</div>
    <div style="display:flex;gap:8px;margin-bottom:14px">${chBadge(c.ch)} ${statusBadge(c.status)} ${c.by==='AI'?'<span class="badge b-ai">AI 生成</span>':''}</div>
    ${Grid4(
      Tile('対象', c.target) +
      Tile('開封率', c.open) +
      Tile('CTR', c.ctr) +
      Tile('CV', c.cv)
    )}
    ${isLive ? `${SecLabel('リアルタイム成果')}<div style="background:#fafbfd;padding:14px;border-radius:10px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:11px;color:var(--text-mute)">売上貢献</div><div style="font-size:22px;font-weight:700;color:var(--success);margin-top:2px">${c.rev}</div></div><span class="badge b-success"><span class="b-dot"></span>配信中</span></div>`:''}
    ${SecLabel('配信設定')}
    <div style="display:flex;flex-direction:column;gap:10px;font-size:12.5px">
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">チャネル</span><span>${c.ch}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">対象セグメント</span><span>${c.target}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">配信日時</span><span>本日 18:00</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">作成者</span><span>${c.by}</span></div>
    </div>
    ${SecLabel('メッセージプレビュー')}
    <div style="background:#fafbfd;border:1px solid var(--border);border-radius:10px;padding:14px;font-size:12.5px;line-height:1.7;color:var(--text-soft)">
      【${c.name}】<br>
      お客様にあわせて、AI が生成したパーソナライズメッセージを配信します。<br>
      <span style="color:var(--accent-hi)">▶ 商品を見る</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      ${isLive
        ? `<button class="btn" onclick="confirmDialog({title:'配信を一時停止',body:'${c.name} の配信を停止します。',confirmText:'停止する',kind:'danger',onConfirm:()=>{toast('配信を停止');closeDrawer()}})">配信を停止</button>
           <button class="btn primary" onclick="toast('詳細レポート')" style="justify-content:center">${Icon('chart',13)} 詳細レポート</button>`
        : `<button class="btn" onclick="toast('編集モード')">編集</button>
           <button class="btn primary" onclick="confirmDialog({title:'配信を開始',body:'${c.name} を ${c.target} に配信します。',confirmText:'開始',onConfirm:()=>{toast('配信を開始');closeDrawer()}})" style="justify-content:center">${Icon('play',12)} 配信開始</button>`
      }
    </div>
  `);
}

function openDeal(c, t, a, src) {
  const probability = src==='AI' ? 72 : 55;
  DRAWER.open(`商談`, `
    <div style="font-size:22px;font-weight:700;margin-bottom:4px">${yen(a)}</div>
    <div style="font-size:13px;color:var(--text-soft);margin-bottom:14px">${t}</div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <span class="badge ${src==='AI'?'b-ai':'b-neutral'}">${src==='AI'?'AI 生成':'手動'}</span>
      <span class="badge b-warn">検討中</span>
    </div>
    ${SecLabel('顧客')}
    <div style="background:#fafbfd;padding:12px;border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;gap:10px"><div class="avatar" style="width:30px;height:30px;font-size:12px">${c[0]}</div><div><div style="font-weight:500">${c}</div><div style="font-size:11px;color:var(--text-mute)">VIP セグメント</div></div></div>
    ${Grid4(
      Tile('成約確度', probability+'%', 'var(--accent-hi)') +
      Tile('予測 GP', '¥'+Math.round(a*0.3/1000)+'K') +
      Tile('クローズ', '5/28') +
      Tile('担当', '梶原')
    )}
    ${SecLabel('進行ステップ')}
    ${Timeline([
      {label:'リード化', time:'5/15', done:true},
      {label:'検討中', time:'5/18', active:true},
      {label:'提案中'},
      {label:'受注'},
    ])}
    ${SecLabel('AI ネクストステップ')}
    <div class="insight" style="padding:14px">
      <div class="insight-ic">${Icon('sparkles',16)}</div>
      <div>
        <h4 style="font-size:13px">3D シミュレーション動画を送付</h4>
        <p style="font-size:12px">類似 VIP 顧客の動画送付後の成約率は +34%。</p>
      </div>
    </div>
    <button class="btn primary lg" style="width:100%;justify-content:center;margin-top:14px" onclick="toast('AI ネクストステップを実行')">アクションを実行</button>
  `);
}

function openInsight(idx) {
  const i = DATA.INSIGHTS[idx];
  if (!i) return;
  DRAWER.open(`AI 提案`, `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div class="insight-ic" style="width:44px;height:44px">${Icon(i.icon,20)}</div>
      <div>
        <div style="font-size:15px;font-weight:600;line-height:1.3">${i.title}</div>
        ${i.urgent ? `<span class="badge b-danger" style="margin-top:6px">優先実行</span>` : ''}
      </div>
    </div>
    ${SecLabel('提案内容')}
    <div style="font-size:13px;line-height:1.7;color:var(--text-soft)">${i.detail}</div>
    ${SecLabel('予測効果')}
    <div style="background:rgba(22,163,74,.06);border:1px solid rgba(22,163,74,.2);border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;color:var(--text-mute)">インパクト</span><span style="font-size:18px;font-weight:700;color:var(--success)">${i.impact}</span></div>
    ${SecLabel('AI 根拠')}
    <div style="font-size:12.5px;line-height:1.7;color:var(--text-soft);background:#fafbfd;padding:14px;border-radius:10px;border:1px solid var(--border)">
      • BigQuery 集計: 過去 30 日の購買・行動ログ<br>
      • 類似顧客群の購買確率モデル（精度 87%）<br>
      • セグメント別最適チャネルマッピング
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="toast('却下しました');closeDrawer()">却下</button>
      <button class="btn primary" onclick="confirmDialog({title:'${i.cta}',body:'AI 推奨アクションを実行します。',confirmText:'実行',onConfirm:()=>{toast('実行しました');closeDrawer()}})" style="justify-content:center">${i.cta}</button>
    </div>
  `);
}

function openApproval(idx) {
  const a = DATA.APPROVALS[idx];
  if (!a) return;
  DRAWER.open(`AI 承認 #${idx+1}`, `
    <span class="badge b-ai">${a.kind}</span>
    <div style="font-size:15px;font-weight:600;margin:10px 0 14px;line-height:1.4">${a.content}</div>
    ${Grid4(
      Tile('対象', a.target) +
      Tile('予測効果', a.impact, 'var(--success)') +
      Tile('リスク', a.risk, a.risk==='高'?'var(--danger)':a.risk==='中'?'var(--warn)':'var(--text)') +
      Tile('起票', a.time)
    )}
    ${SecLabel('AI 根拠')}
    <div style="background:#fafbfd;border:1px solid var(--border);border-radius:10px;padding:14px;font-size:12.5px;line-height:1.7">${a.reason}</div>
    ${SecLabel('実行内容プレビュー')}
    <div style="background:#fafbfd;border:1px dashed var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.6;color:var(--text-soft)">
      action: <span style="color:var(--accent-hi)">${a.kind}</span><br>
      target: <span style="color:var(--ai)">${a.target}</span><br>
      impact: <span style="color:var(--success)">${a.impact}</span><br>
      status: <span style="color:var(--warn)">pending_approval</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="confirmDialog({title:'承認を却下',body:'この提案を却下します。',confirmText:'却下',kind:'danger',onConfirm:()=>{toast('却下しました');closeDrawer()}})">却下</button>
      <button class="btn primary" onclick="confirmDialog({title:'承認・実行',body:'AI が ${a.content} を実行します。',confirmText:'承認',onConfirm:()=>{toast('承認・実行しました');closeDrawer()}})" style="justify-content:center">${Icon('check',13)} 承認・実行</button>
    </div>
  `);
}

function openAgentLog(idx) {
  const l = DATA.AGENT_LOG[idx];
  if (!l) return;
  DRAWER.open(`AI 実行ログ`, `
    <div style="display:flex;gap:8px;margin-bottom:14px;align-items:center">
      <span class="badge b-${l.agent==='接客AI'?'info':l.agent==='営業AI'?'accent':l.agent==='在庫AI'?'warn':'info'}">${l.agent}</span>
      ${statusBadge(l.status)}
      <span class="cell-mono" style="margin-left:auto">${l.time}</span>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--accent-hi);margin-bottom:14px">${l.tool}()</div>
    ${SecLabel('入力')}
    <div style="background:#fafbfd;border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--text-soft);word-break:break-all">${l.input}</div>
    ${SecLabel('結果')}
    <div style="background:#fafbfd;border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:${l.status==='error'?'var(--danger)':'var(--text-soft)'};word-break:break-all">${l.result}</div>
    ${Grid4(
      Tile('所要', l.ms+'ms') +
      Tile('トークン', l.tok) +
      Tile('コスト', '¥'+(l.tok*0.15).toFixed(1)) +
      Tile('ステータス', l.status, l.status==='success'?'var(--success)':l.status==='pending'?'var(--warn)':'var(--danger)')
    )}
  `);
}

function openIntegration(name, data) {
  DRAWER.open(`連携: ${name}`, `
    ${SecLabel('接続状況')}
    <div style="background:rgba(22,163,74,.06);border:1px solid rgba(22,163,74,.2);border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:12.5px">接続済 ・ 最終同期 09:42</span><span class="badge b-success"><span class="b-dot"></span>正常</span></div>
    ${SecLabel('使用統計')}
    ${Grid2(
      Field('今月リクエスト', data.req || '12,438') +
      Field('レイテンシ平均', data.lat || '180ms') +
      Field('エラー率', data.err || '0.04%') +
      Field('コスト', data.cost || '¥-')
    )}
    ${SecLabel('設定')}
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fafbfd;border:1px solid var(--border);border-radius:10px"><span style="font-size:12.5px">エンドポイント</span><span class="cell-mono">api.${name.toLowerCase().replace(/\\s/g,'')}.com</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fafbfd;border:1px solid var(--border);border-radius:10px"><span style="font-size:12.5px">API キー</span><span class="cell-mono">••••••••${Math.floor(Math.random()*9999)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fafbfd;border:1px solid var(--border);border-radius:10px"><span style="font-size:12.5px">自動同期</span><span class="badge b-success">5 分ごと</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="confirmDialog({title:'接続を切断',body:'${name} との連携を停止します。',confirmText:'切断',kind:'danger',onConfirm:()=>{toast('切断しました');closeDrawer()}})">切断</button>
      <button class="btn primary" onclick="toast('同期を実行')" style="justify-content:center">${Icon('refresh',13)} 今すぐ同期</button>
    </div>
  `);
}

function openUser(name, email, role) {
  DRAWER.open(`ユーザー: ${name}`, `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div class="avatar" style="width:48px;height:48px;font-size:18px">${name[0]}</div>
      <div>
        <div style="font-size:15px;font-weight:600">${name}</div>
        <div style="font-size:12px;color:var(--text-mute)">${email}</div>
      </div>
      <span class="badge b-success" style="margin-left:auto"><span class="b-dot"></span>有効</span>
    </div>
    ${Grid2(
      Field('権限', role) +
      Field('AI 実行', role==='管理者'||role==='開発'?'すべて':'承認後') +
      Field('最終ログイン', '5/20 09:30') +
      Field('登録日', '2024/04/01')
    )}
    ${SecLabel('AI 実行権限')}
    <div style="display:flex;flex-direction:column;gap:8px">
      ${['顧客データ読み取り','メール送付','LINE 送付','クーポン発行','発注書ドラフト'].map(p=>`
        <label style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#fafbfd;border:1px solid var(--border);border-radius:10px;font-size:12.5px;cursor:pointer">
          <span>${p}</span>
          <input type="checkbox" class="checkbox" ${Math.random()>0.3?'checked':''}>
        </label>
      `).join('')}
    </div>
    ${SecLabel('直近の操作')}
    <div style="font-size:12px;color:var(--text-mute)">
      <div style="display:flex;gap:10px;padding:6px 0"><span class="cell-mono">09:30</span><span>ログイン</span></div>
      <div style="display:flex;gap:10px;padding:6px 0"><span class="cell-mono">09:32</span><span>承認: 休眠顧客リエンゲージ</span></div>
      <div style="display:flex;gap:10px;padding:6px 0"><span class="cell-mono">09:35</span><span>レポート閲覧</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn danger" onclick="confirmDialog({title:'ユーザー無効化',body:'${name} のアクセスを停止します。',confirmText:'無効化',kind:'danger',onConfirm:()=>{toast('無効化しました');closeDrawer()}})">無効化</button>
      <button class="btn primary" onclick="toast('保存しました');closeDrawer()" style="justify-content:center">保存</button>
    </div>
  `);
}

function openReport(title) {
  DRAWER.open(`レポート: ${title}`, `
    <div style="font-size:12px;color:var(--text-mute);margin-bottom:14px">2026 年 5 月度</div>
    ${Grid4(
      Tile('対象期間', '5/1-20') +
      Tile('生成', 'AI') +
      Tile('行数', '12,438') +
      Tile('鮮度', 'Live')
    )}
    ${SecLabel('サマリー')}
    <div style="font-size:12.5px;line-height:1.7;color:var(--text-soft)">
      今月の売上は ¥6,840,000 で前月比 +14.2%。VIP・リピート顧客の購買が牽引し、AI 接客経由の注文が全体の 58% を占めています。AI 予測では月末 ¥9.2M 着地、目標達成率 92%。
    </div>
    ${SecLabel('主要指標')}
    <div style="display:flex;flex-direction:column;gap:8px">
      ${[['EC 売上','¥6.84M','+14.2%','var(--success)'],['平均単価','¥41,200','+8.4%','var(--success)'],['CVR','4.8%','-0.3%','var(--danger)'],['AI 接客率','58%','+12%','var(--success)']].map(([l,v,d,c])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#fafbfd;border:1px solid var(--border);border-radius:10px;font-size:12.5px">
          <span>${l}</span>
          <div><span style="font-weight:600">${v}</span> <span style="color:${c};margin-left:8px;font-size:11.5px">${d}</span></div>
        </div>
      `).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="toast('PDF を出力')" style="justify-content:center">${Icon('download',13)} PDF</button>
      <button class="btn primary" onclick="toast('全画面で表示')" style="justify-content:center">詳細を表示</button>
    </div>
  `);
}

window.openCustomer = openCustomer;
window.openLead = openLead;
window.openTask = openTask;
window.openOrder = openOrder;
window.openProduct = openProduct;
window.openCampaign = openCampaign;
window.openDeal = openDeal;
window.openInsight = openInsight;
window.openApproval = openApproval;
window.openAgentLog = openAgentLog;
window.openIntegration = openIntegration;
window.openUser = openUser;
window.openReport = openReport;
