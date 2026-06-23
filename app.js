/* ===== Helpers ===== */
const $ = (q, p = document) => p.querySelector(q);
const $$ = (q, p = document) => Array.from(p.querySelectorAll(q));
const yen = n => '¥' + n.toLocaleString();
const yenM = n => { const v = n / 1e6; return '¥' + (Number.isInteger(v) ? v : +v.toFixed(2)) + 'M'; };

/* ===== Clock / greeting (item 4) ===== */
function clockStr(d) { return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'); }
function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 5 ? 'こんばんは' : h < 11 ? 'おはようございます' : h < 18 ? 'こんにちは' : 'こんばんは';
}
function jpDate(d = new Date()) {
  const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${w}曜日`;
}

/* ===== Finance — single source of derived numbers (item 6) =====
   達成率・着地見込率はすべて actual/target・forecast/target から導出。
   KPI・月商チャート・レポートが同じ値を参照するので相互に矛盾しない。 */
function computeFinance() {
  const f = CONFIG.finance;
  return { target: f.target, actual: f.actual, forecast: f.forecast, momGrowth: f.momGrowth, pastMonths: f.pastMonths };
}
function baseMetrics() {
  const f = computeFinance();
  return { actual: f.actual, target: f.target, forecast: f.forecast, momGrowth: f.momGrowth, openTasks: 12, aiTasks: 9, manualTasks: 3 };
}
function metricsView(m) {
  m = m || METRICS;
  return { ...m, achievement: m.actual / m.target, projected: m.forecast / m.target };
}
let METRICS = baseMetrics();
window.getMetrics = () => metricsView();

/* ===== Greeting + KPI rendering (items 4, 6) ===== */
function refreshGreeting() {
  const g = $('#dash-greeting'); if (g) g.textContent = `${greeting()}、${CONFIG.user.name.split(' ')[0]}さん`;
  const d = $('#dash-date');     if (d) d.textContent = `${jpDate()} ・ 今日のダッシュボード`;
}
function renderKPIs() {
  const k = metricsView();
  const el = $('#kpis'); if (!el) return;
  const pct = (k.achievement * 100).toFixed(1);
  el.innerHTML = `
    <div class="kpi">
      <div class="kpi-label">今月EC売上</div>
      <div class="kpi-value">${yen(k.actual)}</div>
      <div class="kpi-delta up">${Icon('arrowUp', 12)} 前月比 +${k.momGrowth.toFixed(1)}%</div>
    </div>
    <div class="kpi featured">
      <div class="kpi-label" style="color:rgba(255,255,255,.8)">月商目標 達成率</div>
      <div class="kpi-value">${pct}%</div>
      <div class="kpi-delta mute" style="color:rgba(255,255,255,.75)">${yenM(k.actual)} / ${yenM(k.target)}</div>
      <div class="progress"><div style="width:${pct}%"></div></div>
    </div>
    <div class="kpi">
      <div class="kpi-label">未対応タスク</div>
      <div class="kpi-value">${k.openTasks}</div>
      <div class="kpi-delta mute"><span class="badge b-ai">AI ${k.aiTasks}件</span> 手動 ${k.manualTasks}件</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">AI 予測 月末着地</div>
      <div class="kpi-value">${yenM(k.forecast)}</div>
      <div class="kpi-delta mute">目標比 ${(k.projected * 100).toFixed(0)}%</div>
    </div>
  `;
}

/* ===== 更新 button — perturb live metrics ±数% (item 5) ===== */
function perturbMetrics() {
  // 売上系のみ微変動（タスク数はサイドバー/タブと整合させるため固定・R2）
  const jit = (v, pct) => Math.round(v * (1 + (Math.random() * 2 - 1) * pct));
  METRICS.actual = jit(METRICS.actual, 0.03);
  METRICS.forecast = jit(METRICS.forecast, 0.03);
  METRICS.momGrowth = +(METRICS.momGrowth + (Math.random() * 2 - 1) * 1.2).toFixed(1);
}
function updateRevenueChart() {
  if (!revChart) return;
  const k = metricsView(), man = n => Math.round(n / 10000);
  revChart.data.datasets[0].data[5] = man(k.actual);
  revChart.data.datasets[1].data[5] = man(k.forecast);
  revChart.update();
}
function pushStreamRow() {
  const s = STREAM_SAMPLES[Math.floor(Math.random() * STREAM_SAMPLES.length)];
  streamRows = [{ ...s, time: nowTime(), new: true }, ...streamRows.slice(0, 11)].map((r, i) => ({ ...r, new: i === 0 }));
  paintStreamRows();
}

/* ===== Unified mapping ===== */
function segBadge(s) {
  const m = {
    '新規':    'b-info',
    'リピート':'b-warn',
    'VIP':     'b-accent',
    '休眠':    'b-neutral',
  };
  return `<span class="badge ${m[s]||'b-neutral'}">${s}</span>`;
}
function statusBadge(s) {
  const m = {
    '新規':       'b-info',
    '出荷準備中': 'b-warn',
    '出荷済':     'b-info',
    '配送完了':   'b-success',
    'キャンセル': 'b-neutral',
    '配信中':     'b-success',
    '予約':       'b-warn',
    '下書き':     'b-neutral',
    '接続済':     'b-success',
    '稼働中':     'b-success',
    '設定中':     'b-warn',
    '有効':       'b-success',
    'success':    'b-success',
    'pending':    'b-warn',
    'error':      'b-danger',
  };
  return `<span class="badge ${m[s]||'b-neutral'}">${s}</span>`;
}
function scoreChip(s) {
  const cls = s >= 90 ? 'hi' : s >= 80 ? 'mid' : s >= 70 ? 'ok' : 'lo';
  return `<span class="score ${cls}"><span>${s}</span><span class="bar"><i style="width:${s}%"></i></span></span>`;
}
function priorityChip(p) {
  const m = { '高':'b-danger','中':'b-warn','低':'b-neutral' };
  return `<span class="badge ${m[p]}">${p}</span>`;
}
function chBadge(c) {
  const m = { 'LINE':'b-success','メール':'b-info','電話':'b-warn','チャット':'b-accent','EC':'b-info','店舗':'b-neutral','広告':'b-warn' };
  return `<span class="badge ${m[c]||'b-neutral'}">${c}</span>`;
}
function fsegBadge(s) {
  const m = { '新規':'b-info','高単価検討中':'b-accent','リピート育成中':'b-warn','VIP':'b-accent','離脱リスク':'b-danger','離脱(1年+)':'b-neutral' };
  return `<span class="badge ${m[s]||'b-neutral'}">${s}</span>`;
}
// リードの旧セグメントを家具セグメント語彙に揃える（Y10・用語統一）
function leadFseg(l) {
  return ({ 'リピート':'リピート育成中', 'VIP':'VIP', '新規':'新規', '休眠':'離脱リスク' })[l.seg] || l.seg;
}
const byScoreDesc = (a, b) => b.score - a.score;

/* ===== 行動スコア (items 7, 8) — score = Σ(action weight) ===== */
function leadScore(acts) { return Math.min(99, (acts || []).reduce((s, a) => s + ((ACTION_TYPES[a] && ACTION_TYPES[a].w) || 0), 0)); }
function scoreRows(acts) { return (acts || []).map(a => ({ key: a, ...ACTION_TYPES[a] })).filter(x => x.label).sort((a, b) => b.w - a.w); }
/* ===== 配信抑制 (item 15) ===== */
function isSuppressed(c) { return !!(c.dlv && c.dlv.week >= c.dlv.cap); }
function suppBadge() { return `<span class="badge b-danger" title="配信頻度上限に到達">${Icon('pause', 9)} 送信抑制中</span>`; }

/* ===== Navigation ===== */
const PAGES = {
  // Today
  dashboard:  { label: 'Dashboard', group: '今日' },
  tasks:      { label: '受信箱', group: '今日' },
  approvals:  { label: 'AI承認待ち', group: '今日' },
  deals:      { label: '商談パイプライン', group: '今日' },
  // Customers
  customers:  { label: '顧客一覧', group: '顧客' },
  leads:      { label: '見込客（リード）', group: '顧客' },
  campaigns:  { label: 'キャンペーン', group: '顧客' },
  workflows:  { label: 'ワークフロー', group: '顧客' },
  // Products
  orders:     { label: '受注管理', group: '商品' },
  inventory:  { label: '在庫・商品', group: '商品' },
  // AI
  insights:   { label: 'AI 提案', group: 'AI' },
  'agent-log':{ label: 'AI 実行ログ', group: 'AI' },
  // Analytics
  reports:    { label: 'レポート', group: '分析' },
  analytics:  { label: 'BigQuery', group: '分析' },
  // Settings
  integrations:{label: '連携・API', group: '設定' },
  users:      { label: 'ユーザー', group: '設定' },
};

function nav(name) {
  $$('.page').forEach(p => p.classList.remove('active'));
  $('#view-' + name).classList.add('active');
  $$('.nav-item').forEach(i => i.classList.remove('active'));
  const btn = $('#nav-' + name);
  if (btn) btn.classList.add('active');
  const p = PAGES[name];
  $('#crumbs').innerHTML = `${p.group} <span style="opacity:.5;margin:0 6px">/</span> <span class="now">${p.label}</span>`;
  window.scrollTo(0, 0);
  $('#content').scrollTo(0, 0);
  if (name === 'dashboard') {
    setTimeout(renderCharts, 50);
    startAgentSimulation();
  } else {
    stopAgentSimulation();
  }
  if (name === 'workflows') setTimeout(renderFunnelChart, 50);
}

/* ===== Sidebar ===== */
function buildSidebar() {
  const groups = {
    '今日':   [['dashboard','home'],['tasks','inbox', 12],['approvals','shield', 4, 'urgent'],['deals','deal']],
    '顧客':   [['customers','users'],['leads','flame', 7, 'urgent'],['campaigns','mail'],['workflows','zap']],
    '商品':   [['orders','box'],['inventory','store']],
    'AI':     [['insights','sparkles', 4, 'ai'],['agent-log','terminal']],
    '分析':   [['reports','chart'],['analytics','db']],
    '設定':   [['integrations','plug'],['users','user']],
  };
  const nav = $('#nav');
  nav.innerHTML = Object.entries(groups).map(([g, items]) => `
    <div class="nav-group ${g==='AI'?'ai-group':''}">
      <p class="nav-label">${g}</p>
      ${items.map(([key, ic, ct, ctc]) => `
        <button class="nav-item" id="nav-${key}" onclick="nav('${key}')">
          <span class="ic">${Icon(ic, 16)}</span>
          <span>${PAGES[key].label}</span>
          ${ct ? `<span class="ct ${ctc||''}">${ct}</span>` : ''}
        </button>
      `).join('')}
    </div>
  `).join('');
}

/* ===== Dashboard ===== */
function renderDashboard() {
  const today = DATA;

  // AI Hero agent mini tiles
  const heroAgents = $('#ai-hero-agents');
  if (heroAgents) {
    heroAgents.innerHTML = [
      {name:'接客AI', calls:142, ic:'chat'},
      {name:'営業AI', calls:38,  ic:'flag'},
      {name:'在庫AI', calls:12,  ic:'box'},
      {name:'分析AI', calls:6,   ic:'chart'},
    ].map(a => `
      <div class="agent-mini-tile" onclick="nav('agent-log')">
        <div class="agent-mini-ic">${Icon(a.ic, 12)}</div>
        <div style="flex:1;min-width:0">
          <div class="agent-mini-name">${a.name}</div>
          <div class="agent-mini-count">今日 ${a.calls} 回</div>
        </div>
        <div class="agent-mini-dot"></div>
      </div>
    `).join('');
  }
  // Greeting + date (item 4 — current time / weekday)
  refreshGreeting();
  // KPIs — all values derived from one metrics object (item 6)
  renderKPIs();

  // AI Agent live activity (the hero)
  $('#agent-stream').innerHTML = `
    <div class="stream-list" id="stream-list"></div>
  `;
  paintStreamRows();

  // AI Recommended actions (right column)
  $('#agents-summary').innerHTML = `
    <div style="display:flex;flex-direction:column;padding:6px 0">
      ${DATA.INSIGHTS.slice(0, 4).map((i, idx) => `
        <div onclick="openInsight(${idx})" style="display:flex;align-items:flex-start;gap:10px;padding:12px 18px;border-bottom:1px solid var(--border-soft);cursor:pointer;transition:background .12s" onmouseover="this.style.background='rgba(107,92,255,.04)'" onmouseout="this.style.background=''">
          <div style="width:28px;height:28px;border-radius:7px;background:var(--accent-bg);color:var(--accent-hi);display:grid;place-items:center;flex-shrink:0">${Icon(i.icon, 14)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12.5px;font-weight:600;line-height:1.4">${i.title}</div>
            <div style="font-size:11px;color:var(--success);margin-top:3px;font-weight:500">${i.impact}</div>
          </div>
          ${i.urgent ? '<span class="badge b-danger" style="flex-shrink:0">優先</span>' : ''}
        </div>
      `).join('')}
    </div>
    <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;font-size:11.5px">
      <span style="color:var(--text-mute)">${DATA.INSIGHTS.length} 件の提案 ・ 4 件承認待ち</span>
      <button class="btn ai sm" onclick="bulkApproveAll()">${Icon('check',12)} 一括承認</button>
    </div>
  `;

  // AI insights (Top 3 — first one featured)
  $('#dash-insights').innerHTML = DATA.INSIGHTS.slice(0, 3).map((i,idx)=>renderInsightCard(i,idx,idx===0)).join('');

  // Tasks
  $('#dash-tasks').innerHTML = DATA.TASKS.slice(0, 5).map(t => `
    <div onclick="openTask(${t.id})" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-soft);font-size:12.5px;cursor:pointer" onmouseover="this.style.background='#fafbfd'" onmouseout="this.style.background=''">
      <input type="checkbox" class="checkbox" onclick="event.stopPropagation()">
      <div style="flex:1">
        <div style="font-weight:500">${t.title}</div>
        <div style="font-size:11px;color:var(--text-mute);margin-top:2px">
          ${Icon('clock',11)} ${t.due}
          ${t.source==='AI' ? ` ・ <span class="badge b-ai">AI: ${t.reason}</span>` : ''}
        </div>
      </div>
      ${priorityChip(t.priority)}
    </div>
  `).join('');

  // Hot leads
  $('#dash-leads').innerHTML = [...DATA.LEADS].sort(byScoreDesc).slice(0, 5).map(l => `
    <div onclick="openLead(${l.id})" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-soft);font-size:12.5px;cursor:pointer" onmouseover="this.style.background='#fafbfd'" onmouseout="this.style.background=''">
      <div style="flex:1">
        <div style="font-weight:500">${l.name} <span style="color:var(--text-mute);font-size:11px;margin-left:4px">${fsegBadge(leadFseg(l))}</span></div>
        <div style="font-size:11px;color:var(--text-mute);margin-top:2px">${l.last}</div>
      </div>
      ${scoreChip(l.score)}
    </div>
  `).join('');
}

/* ===== Live agent simulation ===== */
let streamRows = [];
let streamTimer = null;

function paintStreamRows() {
  if (!streamRows.length) {
    const t0 = Date.now();
    streamRows = DATA.AGENT_LOG.slice(0, 8).map((r, i) => ({ ...r, time: clockStr(new Date(t0 - i * 78000)), new: false, _idx: i }));
  }
  const sl = $('#stream-list');
  if (!sl) return;
  sl.innerHTML = streamRows.map((r,i) => {
    const agentColor = { '接客AI':'b-info', '営業AI':'b-accent', '在庫AI':'b-warn', '分析AI':'b-info' }[r.agent] || 'b-neutral';
    const statusIc = r.status === 'success' ? `<span class="badge b-success">${Icon('check',10)}</span>` :
                     r.status === 'pending' ? `<span class="badge b-warn">承認待</span>` :
                     `<span class="badge b-danger">エラー</span>`;
    const idx = r._idx !== undefined ? r._idx : 0;
    return `
      <div class="stream-row ${r.new?'new':''}" style="cursor:pointer" onclick="openAgentLog(${idx})" onmouseover="this.style.background='#fafbfd'" onmouseout="this.style.background=''">
        <div class="t">${r.time}</div>
        <div><span class="badge ${agentColor}">${r.agent}</span></div>
        <div class="msg">
          <span class="arg">${r.tool}</span>
          <span class="muted">(</span><span class="arg" style="color:var(--text-soft)">${escapeHtml(r.input).slice(0,42)}</span><span class="muted">)</span>
          <span class="muted"> → </span>${r.result}
          <span class="muted" style="margin-left:6px;font-size:10.5px">${r.ms}ms · ${r.tok}t</span>
        </div>
        <div>${statusIc}</div>
      </div>
    `;
  }).join('');
}

const STREAM_SAMPLES = [
  {agent:'接客AI', tool:'search_products', input:'category=ラグ', result:'5件', ms:295, tok:402, status:'success'},
  {agent:'接客AI', tool:'ar_view',         input:'sku=SOFA-001 部屋に試し置き', result:'AR起動', ms:210, tok:180, status:'success'},
  {agent:'営業AI', tool:'send_line',       input:'佐藤 美咲', result:'承認待ち', ms:88, tok:240, status:'pending'},
  {agent:'接客AI', tool:'get_customer',    input:'cid=4', result:'山本 葵', ms:118, tok:312, status:'success'},
  {agent:'在庫AI', tool:'bigquery_sql',    input:'velocity 7d', result:'6 rows', ms:1820, tok:520, status:'success'},
  {agent:'営業AI', tool:'create_task',     input:'AR体験リンク送付', result:'TASK-2345 作成', ms:142, tok:380, status:'success'},
];
function startAgentSimulation() {
  stopAgentSimulation();
  streamTimer = setInterval(pushStreamRow, 3200);
}
function stopAgentSimulation() { if (streamTimer) { clearInterval(streamTimer); streamTimer = null; } }
function nowTime() { return clockStr(new Date()); }
function escapeHtml(s) { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

/* ===== Insight card ===== */
function renderInsightCard(i, idx, featured) {
  const safeTitle = i.title.replace(/'/g, "\\'");
  return `
    <div class="insight clickable ${featured?'featured':''}" onclick="openInsight(${idx})" style="cursor:pointer">
      <div class="insight-ic">${Icon(i.icon, 18)}</div>
      <div>
        <h4>${i.title} ${i.urgent ? '<span class="badge b-danger" style="margin-left:6px">優先</span>' : ''}</h4>
        <p>${i.detail}</p>
        <div class="impact">${i.impact}</div>
      </div>
      <div class="insight-actions" onclick="event.stopPropagation()">
        <button class="btn primary sm" onclick="confirmDialog({title:'${safeTitle}',body:'AI アクションを実行します',confirmText:'${i.cta}',onConfirm:()=>toast('実行しました')})">${i.cta}</button>
        <button class="btn ghost sm" onclick="toast('後で確認')">後で</button>
      </div>
    </div>
  `;
}

/* ===== Customers ===== */
function renderCustomers() {
  const f = window.custFilters || {};
  const seg = f.seg || '全セグメント';
  const rows = DATA.CUSTOMERS.filter(c => {
    if (seg !== '全セグメント' && c.fseg !== seg) return false;
    if (f.score === '高 (80+)'   && !(c.score >= 80)) return false;
    if (f.score === '中 (50-79)' && !(c.score >= 50 && c.score < 80)) return false;
    if (f.score === '低'         && !(c.score < 50)) return false;
    if (f.ch && f.ch !== '登録チャネル' && c.ch !== f.ch) return false;
    if (f.q && !(c.name.includes(f.q) || c.id.toLowerCase().includes(f.q.toLowerCase()))) return false;
    return true;
  });
  $('#customers-table tbody').innerHTML = rows.map(c => `
    <tr class="clickable" onclick="openCustomer('${c.id}')">
      <td><input type="checkbox" class="checkbox" onclick="event.stopPropagation()"></td>
      <td class="cell-mono">${c.id}</td>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:26px;height:26px;font-size:10.5px">${c.name[0]}</div>
        <span style="font-weight:500">${c.name}</span>
        ${isSuppressed(c) ? suppBadge() : ''}
      </div></td>
      <td>${fsegBadge(c.fseg)}</td>
      <td style="font-weight:500">${yen(c.ltv)}</td>
      <td class="cell-mute">${c.last}</td>
      <td>${c.count}回</td>
      <td>${chBadge(c.ch)}</td>
      <td>${scoreChip(c.score)}</td>
    </tr>
  `).join('') || `<tr><td colspan="9" style="padding:28px;text-align:center;color:var(--text-mute)">条件に一致する顧客がいません</td></tr>`;
  const active = (seg !== '全セグメント') || (f.score && f.score !== 'LTV スコア') || (f.ch && f.ch !== '登録チャネル') || !!f.q;
  const pg = document.querySelector('#view-customers .pager span');
  if (pg) pg.textContent = active ? `${rows.length} 件（絞り込み中 / 全 5,432 件）` : '1 — 12 / 5,432 件';
}
function applyCustomerFilter() {
  const sels = document.querySelectorAll('#view-customers .filterbar select');
  const inp = document.querySelector('#view-customers .filterbar input');
  window.custFilters = {
    seg:   sels[0] ? sels[0].value : '全セグメント',
    score: sels[1] ? sels[1].value : 'LTV スコア',
    ch:    sels[2] ? sels[2].value : '登録チャネル',
    q:     inp ? inp.value.trim() : '',
  };
  renderCustomers();
  toast(`絞り込み: ${document.querySelectorAll('#customers-table tbody tr').length} 件`);
}
window.applyCustomerFilter = applyCustomerFilter;

/* ===== Leads ===== */
function renderLeadTiles() {
  const ls = DATA.LEADS;
  const n = (lo, hi) => ls.filter(l => l.score >= lo && l.score < hi).length;
  const el = $('#lead-tiles'); if (!el) return;
  el.innerHTML = `
    <div class="tile"><div class="lab">スコア 90+</div><div class="val" style="color:var(--danger)">${ls.filter(l => l.score >= 90).length} 名</div></div>
    <div class="tile"><div class="lab">スコア 80-89</div><div class="val" style="color:var(--warn)">${n(80, 90)} 名</div></div>
    <div class="tile"><div class="lab">スコア 70-79</div><div class="val" style="color:var(--success)">${n(70, 80)} 名</div></div>
    <div class="tile"><div class="lab">スコア 70未満</div><div class="val">${ls.filter(l => l.score < 70).length} 名</div></div>`;
}
function renderLeads() {
  renderLeadTiles();
  $('#leads-table tbody').innerHTML = [...DATA.LEADS].sort(byScoreDesc).map(l => `
    <tr class="clickable" onclick="openLead(${l.id})">
      <td><input type="checkbox" class="checkbox" onclick="event.stopPropagation()"></td>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:26px;height:26px;font-size:10.5px">${l.name[0]}</div>
        <span style="font-weight:500">${l.name}</span>
      </div></td>
      <td>${scoreChip(l.score)}</td>
      <td>${fsegBadge(leadFseg(l))}</td>
      <td class="cell-mute" style="max-width:220px">${l.last}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="badge b-ai">${Icon('sparkles',10)} AI</span>
          <span style="color:var(--accent-hi);font-size:12px">${l.action}</span>
        </div>
      </td>
      <td style="font-weight:600">${yen(l.revenue)}</td>
      <td>${chBadge(l.ch)}</td>
      <td>
        <button class="btn ai sm" onclick="event.stopPropagation();confirmDialog({title:'AI アクションを実行',body:'${l.name}さまへ ${l.action} を実行します。',confirmText:'承認・実行',onConfirm:()=>toast('${l.name}さまへアプローチを実行')})">実行</button>
      </td>
    </tr>
  `).join('');
}

/* ===== Deals ===== */
function renderDeals() {
  // ヘッダーの数値をボードから算出（R3・看板と一致させる）
  const cols = DATA.DEALS_BOARD, allItems = cols.flatMap(c => c.items);
  const openSum = cols.filter(c => c.key !== 'won').flatMap(c => c.items).reduce((s, d) => s + d.a, 0);
  const aiN = allItems.filter(d => d.src === 'AI').length, manN = allItems.length - aiN;
  const sub = document.querySelector('#view-deals .page-sub');
  if (sub) sub.textContent = `月内見込 ${yen(openSum)} ・ AI 自動生成 ${aiN} 件 / 手動 ${manN} 件`;
  $('#deals-board').innerHTML = DATA.DEALS_BOARD.map(c => `
    <div class="kanban-col col-${c.color}">
      <h4>
        <span>${c.title} <span style="color:var(--text-dim);margin-left:4px">${c.count}</span></span>
        <span style="color:var(--text-soft);text-transform:none;font-size:11px">${c.sum}</span>
      </h4>
      ${c.items.map((d,i) => `
        <div class="kanban-card" onclick="openDeal('${d.c}','${d.t}',${d.a},'${d.src}')">
          <div class="who">${d.c}</div>
          <div class="topic">${d.t}</div>
          <div class="row">
            <div class="amt">${yen(d.a)}</div>
            <span class="badge ${d.src==='AI'?'b-ai':'b-neutral'}">${d.src==='AI'?'🤖 AI':'手動'}</span>
          </div>
        </div>
      `).join('')}
      <button class="btn ghost sm" onclick="toast('商談を追加')" style="width:100%;justify-content:center;margin-top:4px;color:var(--text-mute)">${Icon('plus',12)} 追加</button>
    </div>
  `).join('');
}

/* ===== Tasks ===== */
function renderTasks() {
  const priBar = { '高':'var(--danger)','中':'var(--warn)','低':'var(--text-dim)' };
  const statusCls = { '未対応':'b-warn','対応中':'b-info','完了':'b-success' };
  // tab counts are derived from data (Y17)
  const counts = {}; DATA.TASKS.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);
  const order = ['未対応', '対応中', '完了'];
  document.querySelectorAll('#view-tasks .tabs .tab').forEach((tab, i) => {
    const ct = tab.querySelector('.ct'); if (ct && order[i]) ct.textContent = counts[order[i]] || 0;
  });
  const f = window.taskFilter || '未対応';
  const rows = DATA.TASKS.filter(t => f === 'すべて' || t.status === f);
  $('#tasks-list').innerHTML = rows.length ? rows.map(t => `
    <div class="clickable" onclick="openTask(${t.id})" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--border-soft);cursor:pointer">
      <input type="checkbox" class="checkbox" onclick="event.stopPropagation()">
      <div style="width:3px;height:32px;border-radius:2px;background:${priBar[t.priority]}"></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${t.title}</div>
        <div style="font-size:11.5px;color:var(--text-mute);margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="badge ${statusCls[t.status] || 'b-neutral'}">${t.status}</span>
          ${t.customer !== '-' ? `<span>${Icon('user',11)} ${t.customer}</span>` : ''}
          <span>${Icon('clock',11)} ${t.due}</span>
          ${t.source==='AI'
            ? `<span class="badge b-ai">${Icon('sparkles',10)} AI: ${t.reason}</span>`
            : `<span class="badge b-neutral">手動</span>`}
        </div>
      </div>
      ${priorityChip(t.priority)}
      <button class="btn sm" onclick="event.stopPropagation();openTask(${t.id})">対応する</button>
    </div>
  `).join('') : `<div style="padding:28px;text-align:center;color:var(--text-mute);font-size:12.5px">「${f}」のタスクはありません</div>`;
}

/* ===== Orders ===== */
function renderOrders() {
  const osub = document.querySelector('#view-orders .page-sub');
  if (osub) osub.textContent = `今月 168 件 / ${yen(metricsView().actual)}`;
  $('#orders-table tbody').innerHTML = DATA.ORDERS.map(o => `
    <tr class="clickable" onclick="openOrder('${o.no}')">
      <td class="cell-mono">${o.no}</td>
      <td class="cell-mute">${o.dt}</td>
      <td style="font-weight:500">${o.customer}</td>
      <td class="cell-mute">${o.item}</td>
      <td style="font-weight:600">${yen(o.amt)}</td>
      <td>${o.pay}</td>
      <td>${statusBadge(o.status)}</td>
      <td>${o.ai ? `<span class="badge b-ai">${Icon('sparkles',10)} 経由</span>` : '<span class="cell-mute">—</span>'}</td>
    </tr>
  `).join('');
}

/* ===== Inventory ===== */
function renderInventory() {
  const advCls = {'発注推奨':'b-danger','監視':'b-warn'};
  $('#inventory-table tbody').innerHTML = DATA.INVENTORY.map(p => {
    const stockCls = p.stock<5 ? 'color:var(--danger);font-weight:700' : p.stock<10 ? 'color:var(--warn);font-weight:600' : '';
    return `
    <tr class="clickable" onclick="openProduct('${p.sku}')">
      <td class="cell-mono">${p.sku}</td>
      <td style="font-weight:500">${p.name}</td>
      <td class="cell-mute">${p.cat}</td>
      <td>${yen(p.price)}</td>
      <td style="${stockCls}">${p.stock}</td>
      <td class="cell-mute">${p.views.toLocaleString()}</td>
      <td>${p.cvr}</td>
      <td><span class="badge ${p.ar.includes('3D')?'b-accent':'b-info'}">${p.ar}</span></td>
      <td>${p.advice!=='-' ? `<span class="badge ${advCls[p.advice]}">${p.advice}</span>` : '<span class="cell-mute">—</span>'}</td>
    </tr>`;
  }).join('');
}

/* ===== Campaigns ===== */
function renderCampaigns() {
  $('#campaigns-table tbody').innerHTML = DATA.CAMPAIGNS.map(c => `
    <tr class="clickable" onclick="openCampaign('${c.name}')">
      <td style="font-weight:500">${c.name}</td>
      <td>${chBadge(c.ch)}</td>
      <td class="cell-mute">${c.target}</td>
      <td>${c.open}</td>
      <td>${c.ctr}</td>
      <td>${c.cv}</td>
      <td style="font-weight:600">${c.rev}</td>
      <td>${statusBadge(c.status)}</td>
      <td>${c.by==='AI' ? '<span class="badge b-ai">AI 自動</span>' : c.by}</td>
    </tr>
  `).join('');
}

/* ===== Workflows (items 12, 14) ===== */
let selectedWf = null;
function renderWorkflows() {
  const list = $('#wf-list'); if (!list) return;
  if (!selectedWf) selectedWf = DATA.WORKFLOWS[0].id;
  list.innerHTML = DATA.WORKFLOWS.map(w => `
    <div class="wf-item ${w.id === selectedWf ? 'active' : ''}" onclick="selectWorkflow('${w.id}')">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-weight:600;font-size:12.5px">${w.name}</span>
        ${statusBadge(w.status)}
      </div>
      <div style="font-size:11px;color:var(--text-mute);margin-top:5px;display:flex;align-items:center;gap:5px">${Icon('zap', 10)} ${w.trigger}</div>
      <div style="font-size:11px;color:var(--text-mute);margin-top:6px;display:flex;gap:12px"><span>登録 ${w.enrolled}名</span><span>CV率 <b style="color:var(--success)">${w.cvr}</b></span></div>
    </div>`).join('');
  renderWfCanvas();
}
function selectWorkflow(id) { selectedWf = id; renderWorkflows(); }
function renderWfCanvas() {
  const c = $('#wf-canvas'); if (!c) return;
  const w = DATA.WORKFLOWS.find(x => x.id === selectedWf) || DATA.WORKFLOWS[0];
  const meta = { trigger:{ic:'zap',t:'トリガー'}, send:{ic:'mail',t:'送信'}, wait:{ic:'clock',t:'待機'}, branch:{ic:'filter',t:'分岐'}, goal:{ic:'check',t:'ゴール'} };
  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div><div class="card-title">${w.name}</div><div class="card-sub" style="display:flex;align-items:center;gap:5px;margin-top:2px">${Icon('zap',11)} トリガー: ${w.trigger}</div></div>
      ${statusBadge(w.status)}
    </div>
    <div style="display:flex;flex-direction:column">
      ${w.nodes.map((n, i) => {
        const m = meta[n.type] || { ic:'cpu', t:n.type };
        return `<div class="wf-node wf-${n.type}"><span class="wf-ic">${Icon(m.ic, 14)}</span><div style="min-width:0"><div class="wf-type">${m.t}</div><div class="wf-label">${n.label}</div></div></div>${i < w.nodes.length - 1 ? '<div class="wf-conn"></div>' : ''}`;
      }).join('')}
    </div>`;
}
let funnelChart = null;
function renderFunnelChart() {
  const cv = $('#funnelChart'); if (!cv) return;
  if (funnelChart) { funnelChart.resize(); return; }
  const f = DATA.FUNNEL, txt = '#767c95', grid = 'rgba(20,21,42,.06)';
  const primary = CONFIG.brand.primary, secondary = CONFIG.brand.secondary;
  funnelChart = new Chart(cv, {
    type: 'line',
    data: { labels: f.weeks, datasets: [
      { label:'CV率 (%)', data:f.cvr, borderColor:primary, backgroundColor:_hexToRgba(primary, .10), fill:true, tension:.35, borderWidth:2, pointRadius:2, yAxisID:'y' },
      { label:'開封率 (%)', data:f.open, borderColor:secondary, fill:false, tension:.35, borderWidth:2, pointRadius:2, yAxisID:'y1' },
      { label:'配信解除率 (%)', data:f.unsub, borderColor:'#e11d48', borderDash:[4,3], fill:false, tension:.35, borderWidth:1.5, pointRadius:2, yAxisID:'y' },
    ] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position:'bottom', labels:{ color:txt, font:{size:11}, boxWidth:12 } } },
      scales: {
        x:  { ticks:{ color:txt, font:{size:10.5} }, grid:{ color:grid } },
        y:  { position:'left',  ticks:{ color:txt, font:{size:10}, callback:v=>v+'%' }, grid:{ color:grid }, title:{ display:true, text:'CV率 / 解除率', color:txt, font:{size:10} } },
        y1: { position:'right', ticks:{ color:txt, font:{size:10}, callback:v=>v+'%' }, grid:{ display:false }, title:{ display:true, text:'開封率', color:txt, font:{size:10} } },
      }
    }
  });
}

/* ===== Insights ===== */
function renderInsights() {
  $('#insights-list').innerHTML = DATA.INSIGHTS.map((i,idx) => renderInsightCard(i, idx, idx===0)).join('');
}

/* ===== Approvals ===== */
function renderApprovals() {
  const riskCls = {'高':'b-danger','中':'b-warn','低':'b-neutral'};
  $('#approvals-table tbody').innerHTML = DATA.APPROVALS.map((a,idx) => `
    <tr class="clickable" onclick="openApprovalCompose(${idx})">
      <td><span class="badge b-ai">${a.kind}</span></td>
      <td style="font-weight:500">${a.content}</td>
      <td class="cell-mute">${a.target}</td>
      <td style="font-weight:600;color:var(--success)">${a.impact}</td>
      <td><span class="badge ${riskCls[a.risk]}">${a.risk}</span></td>
      <td class="cell-mute" style="max-width:240px">${a.reason}</td>
      <td class="cell-mute">${a.time}</td>
      <td>
        <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
          <button class="btn success sm" onclick="confirmDialog({title:'承認・実行',body:'${a.content}',confirmText:'承認',onConfirm:()=>toast('承認しました')})">${Icon('check',12)} 承認</button>
          <button class="btn ghost sm" onclick="toast('却下しました')">却下</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ===== Agent log ===== */
function renderAgentLog() {
  $('#agent-log-table tbody').innerHTML = DATA.AGENT_LOG.map((l,idx) => {
    const agentColor = { '接客AI':'b-info', '営業AI':'b-accent', '在庫AI':'b-warn', '分析AI':'b-info' }[l.agent] || 'b-neutral';
    return `
      <tr class="clickable" onclick="openAgentLog(${idx})">
        <td class="cell-mono">${l.time}</td>
        <td><span class="badge ${agentColor}">${l.agent}</span></td>
        <td class="cell-mono" style="color:var(--accent-hi)">${l.tool}</td>
        <td class="cell-mute" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.input}</td>
        <td class="cell-mute">${l.result}</td>
        <td class="cell-mute">${l.ms}ms</td>
        <td class="cell-mute">${l.tok}</td>
        <td>${statusBadge(l.status)}</td>
      </tr>
    `;
  }).join('');
}

/* Drawer/details rendered in details.js */

/* ===== Toast ===== */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="icn">${Icon('check',14)}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

/* ===== Charts ===== */
let chartsRendered = false;
let revChart = null;
function renderCharts() {
  if (chartsRendered) return;
  chartsRendered = true;
  const txt = '#767c95';
  const grid = 'rgba(20,21,42,.06)';
  const primary = CONFIG.brand.primary, secondary = CONFIG.brand.secondary;

  // Revenue series derived from the SAME metrics as the KPIs (item 6)
  const k = metricsView(), man = n => Math.round(n / 10000);
  const past = CONFIG.finance.pastMonths;                       // 過去5ヶ月（万円）
  const actualSeries = [...past, man(k.actual), null, null, null, null, null, null];
  const forecastSeries = [null, null, null, null, past[past.length - 1], man(k.forecast), 960, 1000, 1040, 1070, 1100, 1140];
  const targetSeries = Array(12).fill(man(k.target));

  revChart = new Chart($('#revenueChart'), {
    type: 'line',
    data: {
      labels: ['12月','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月'],
      datasets: [
        {label:'実績', data: actualSeries,
          borderColor: primary, backgroundColor: _hexToRgba(primary, .10), fill:true, tension:.35, borderWidth:2, pointRadius:3, pointBackgroundColor: primary},
        {label:'AI 予測（着地）', data: forecastSeries,
          borderColor: secondary, borderDash:[5,3], fill:false, tension:.35, borderWidth:2, pointRadius:0},
        {label:'目標', data: targetSeries,
          borderColor:'rgba(225,29,72,.45)', borderDash:[2,3], pointRadius:0, fill:false, borderWidth:1.5},
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins:{ legend:{ position:'bottom', labels:{ color: txt, font:{size:11}, boxWidth:12 } } },
      scales:{
        x:{ ticks:{ color:txt, font:{size:10.5} }, grid:{ color: grid } },
        y:{ ticks:{ color:txt, font:{size:10.5}, callback: v => v + '万' }, grid:{ color: grid } },
      }
    }
  });
  new Chart($('#channelChart'), {
    type: 'doughnut',
    data: { labels:['EC','LINE','メール','広告','その他'],
      datasets:[{ data:[42,23,15,12,8],
        backgroundColor:[primary, secondary,'#2563eb','#d97706','#a4a8bd'],
        borderColor:'#ffffff', borderWidth:2 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout:'68%',
      plugins:{ legend:{ position:'right', labels:{ color: txt, font:{size:11}, boxWidth:10, padding:10 } } } }
  });
}

/* ===== Wire up static elements ===== */
function wireStaticElements() {
  // Integration cards
  const intgConfig = [
    ['Oracle Database', {req:'12,438',lat:'85ms',err:'0.01%',cost:'¥-'}],
    ['BigQuery', {req:'2,184',lat:'1.2s',err:'0%',cost:'¥22,400'}],
    ['Google Analytics 4', {req:'24,892',lat:'320ms',err:'0.02%'}],
    ['Anthropic Claude API', {req:'1.2M tokens',lat:'2.4s',err:'0.04%',cost:'¥143,000'}],
    ['LINE Messaging API', {req:'8,432',lat:'140ms',err:'0.08%',cost:'¥28,000'}],
    ['MCP Server', {req:'198',lat:'42ms',err:'0%'}],
    ['Google Recommendation', {req:'18,420',lat:'95ms',err:'0%'}],
    ['SendGrid', {req:'-',lat:'-',err:'-'}],
  ];
  $$('#view-integrations .intg').forEach((el, i) => {
    if (!intgConfig[i]) return;
    el.style.cursor = 'pointer';
    el.onclick = () => openIntegration(intgConfig[i][0], intgConfig[i][1]);
  });

  // Users
  const userRows = [
    [CONFIG.user.name, CONFIG.user.email, CONFIG.user.role],
    ['山田（営業）','yamada@seasquare.co.jp','営業'],
    ['鈴木（CS）','suzuki@seasquare.co.jp','CS'],
    ['田中（開発）','tanaka@seasquare.co.jp','開発'],
  ];
  $$('#view-users tbody tr').forEach((tr, i) => {
    if (!userRows[i]) return;
    tr.style.cursor = 'pointer';
    tr.onclick = (e) => { if (!e.target.closest('button')) openUser(...userRows[i]); };
    const editBtn = tr.querySelector('button');
    if (editBtn) editBtn.onclick = (e) => { e.stopPropagation(); openUser(...userRows[i]); };
  });

  // Bell
  const bell = $$('header .icon-btn').slice(-1)[0];
  if (bell) bell.onclick = () => toast('通知: 未読 3 件（AI 承認待ち 4 件、在庫アラート 3 件）');

  // Filter 「適用」 button (customers) — real furniture-segment filter (item 9)
  $$('.filterbar .btn.primary').forEach(b => b.onclick = applyCustomerFilter);
}

/* ===== Boot ===== */
// スコアは行動から導出（item 7）— ここで一元計算しておく
DATA.LEADS.forEach(l => l.score = leadScore(l.acts));
DATA.CUSTOMERS.forEach(c => c.score = leadScore(c.acts));
buildSidebar();
renderDashboard();
renderCustomers();
renderLeads();
renderDeals();
renderTasks();
renderOrders();
renderInventory();
renderCampaigns();
renderWorkflows();
renderInsights();
renderApprovals();
renderAgentLog();
wireStaticElements();

// Fallback: any unwired button in page-head toasts a placeholder
document.addEventListener('click', e => {
  const btn = e.target.closest('.page.active .page-head .btn');
  if (!btn || btn.onclick || btn.dataset.wired) return;
  if (btn.classList.contains('primary')) {
    toast('「' + btn.textContent.trim() + '」 を実行しました');
  } else {
    toast(btn.textContent.trim() + ' を実行');
  }
});

nav('dashboard');
