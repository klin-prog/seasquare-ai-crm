/* ===== Helpers ===== */
const $ = (q, p = document) => p.querySelector(q);
const $$ = (q, p = document) => Array.from(p.querySelectorAll(q));
const yen = n => '¥' + n.toLocaleString();

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
}

/* ===== Sidebar ===== */
function buildSidebar() {
  const groups = {
    '今日':   [['dashboard','home'],['tasks','inbox', 12],['approvals','shield', 4, 'urgent'],['deals','deal']],
    '顧客':   [['customers','users'],['leads','flame', 7, 'urgent'],['campaigns','mail']],
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
  // KPIs
  $('#kpis').innerHTML = `
    <div class="kpi">
      <div class="kpi-label">今月EC売上</div>
      <div class="kpi-value">¥6,840,000</div>
      <div class="kpi-delta up">${Icon('arrowUp',12)} 前月比 +14.2%</div>
    </div>
    <div class="kpi featured">
      <div class="kpi-label" style="color:rgba(255,255,255,.8)">月商目標 達成率</div>
      <div class="kpi-value">68.4%</div>
      <div class="kpi-delta mute" style="color:rgba(255,255,255,.75)">¥6.84M / ¥10M</div>
      <div class="progress"><div style="width:68.4%"></div></div>
    </div>
    <div class="kpi">
      <div class="kpi-label">未対応タスク</div>
      <div class="kpi-value">12</div>
      <div class="kpi-delta mute"><span class="badge b-ai">AI 9件</span> 手動 3件</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">AI 予測 月末着地</div>
      <div class="kpi-value">¥9.2M</div>
      <div class="kpi-delta mute">信頼区間 ±5%</div>
    </div>
  `;

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

  // Hot leads (スコア上位5件)
  const hotLeads = computeLeadRows({ windowMonths: 2 }).slice(0, 5);
  $('#dash-leads').innerHTML = hotLeads.map(l => `
    <div onclick="openLead('${l.id}')" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-soft);font-size:12.5px;cursor:pointer" onmouseover="this.style.background='#fafbfd'" onmouseout="this.style.background=''">
      <div style="flex:1;min-width:0">
        <div style="font-weight:500;display:flex;align-items:center;gap:6px">
          ${l.name || '<span style="color:var(--text-mute)">匿名（未登録）</span>'}
          <span class="badge ${l.group==='A'?'b-accent':'b-neutral'}" style="font-size:9.5px">${l.group}</span>
        </div>
        <div style="font-size:11px;color:var(--text-mute);margin-top:2px">${l.topProduct || '—'} ・ <span class="badge ${l.band.cls}" style="font-size:9.5px">${l.band.label}</span></div>
      </div>
      <span style="font-size:15px;font-weight:700;color:${l.band.color}">${l.total}</span>
    </div>
  `).join('');
}

/* ===== Live agent simulation ===== */
let streamRows = [];
let streamTimer = null;

function paintStreamRows() {
  if (!streamRows.length) {
    streamRows = DATA.AGENT_LOG.slice(0, 8).map((r,i) => ({...r, new: false, _idx: i}));
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

function startAgentSimulation() {
  stopAgentSimulation();
  streamTimer = setInterval(() => {
    const samples = [
      {agent:'接客AI', tool:'search_products', input:'category=ラグ', result:'5件', ms:295, tok:402, status:'success'},
      {agent:'営業AI', tool:'send_line',       input:'佐藤 美咲', result:'承認待ち', ms:88, tok:240, status:'pending'},
      {agent:'接客AI', tool:'get_customer',    input:'cid=4', result:'山本 葵', ms:118, tok:312, status:'success'},
      {agent:'在庫AI', tool:'bigquery_sql',    input:'velocity 7d', result:'6 rows', ms:1820, tok:520, status:'success'},
      {agent:'営業AI', tool:'create_task',     input:'AR体験リンク送付', result:'TASK-2345 作成', ms:142, tok:380, status:'success'},
    ];
    const next = {...samples[Math.floor(Math.random()*samples.length)], time: nowTime(), new: true};
    streamRows = [next, ...streamRows.slice(0, 11)].map((r,i) => ({...r, new: i===0}));
    paintStreamRows();
  }, 3200);
}
function stopAgentSimulation() { if (streamTimer) { clearInterval(streamTimer); streamTimer = null; } }
function nowTime() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
}
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
  $('#customers-table tbody').innerHTML = DATA.CUSTOMERS.map(c => `
    <tr class="clickable" onclick="openCustomer('${c.id}')">
      <td><input type="checkbox" class="checkbox" onclick="event.stopPropagation()"></td>
      <td class="cell-mono">${c.id}</td>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:26px;height:26px;font-size:10.5px">${c.name[0]}</div>
        <span style="font-weight:500">${c.name}</span>
      </div></td>
      <td>${segBadge(c.seg)}</td>
      <td style="font-weight:500">${yen(c.ltv)}</td>
      <td class="cell-mute">${c.last}</td>
      <td>${c.count}回</td>
      <td>${chBadge(c.ch)}</td>
      <td>${scoreChip(c.score)}</td>
    </tr>
  `).join('');
}

/* ===== Leads (scoring) ===== */
let LEAD_WINDOW = 2;

function scoreBar(row) {
  const segs = row.breakdown.map(b =>
    `<span title="${b.label}: ${b.points}点${b.perTime?` (${b.count}回×${b.unit})`:''}" style="width:${b.points}%;background:${b.color}"></span>`
  ).join('');
  return `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:15px;font-weight:700;letter-spacing:-.01em;width:28px;color:${row.band.color}">${row.total}</span>
      <span style="flex:1;display:flex;height:8px;border-radius:5px;overflow:hidden;background:var(--surface-2);min-width:110px">${segs}</span>
    </div>`;
}

function leadFilters() {
  return {
    group: ($('#f-group')||{}).value || '',
    band:  ($('#f-band')||{}).value || '',
    product: ($('#f-product')||{}).value || '',
  };
}

function currentLeadRows() {
  const f = leadFilters();
  return computeLeadRows({ windowMonths: LEAD_WINDOW }).filter(r =>
    (!f.group   || r.group === f.group) &&
    (!f.band    || r.band.key === f.band) &&
    (!f.product || r.topSku === f.product)
  );
}

function renderLeadMatrix() {
  const rows = computeLeadRows({ windowMonths: LEAD_WINDOW });
  const groups = [['A','A：会員'], ['B','B：メール非会員']];
  const bands = [['hot','ホット','var(--danger)'], ['warm','ウォーム','var(--warn)'], ['cold','コールド','var(--info)'], ['excluded','対象外','var(--text-mute)']];
  const cell = (g, b) => rows.filter(r => (!g || r.group===g) && (!b || r.band.key===b)).length;

  const head = `<tr>
    <th style="text-align:left">グループ</th>
    ${bands.map(b=>`<th style="text-align:center;color:${b[2]}">${b[1]}</th>`).join('')}
    <th style="text-align:center">合計</th>
  </tr>`;
  const body = groups.map(g => `
    <tr>
      <td style="font-weight:600">${g[1]}</td>
      ${bands.map(b => {
        const n = cell(g[0], b[0]);
        return `<td style="text-align:center"><button class="matrix-cell" onclick="jumpLead('${g[0]}','${b[0]}')" ${n?'':'disabled'}>${n}</button></td>`;
      }).join('')}
      <td style="text-align:center;font-weight:700">${cell(g[0],'')}</td>
    </tr>`).join('');
  const foot = `
    <tr style="border-top:2px solid var(--border)">
      <td style="font-weight:700">合計</td>
      ${bands.map(b => `<td style="text-align:center;font-weight:700">${cell('',b[0])}</td>`).join('')}
      <td style="text-align:center;font-weight:700">${rows.length}</td>
    </tr>`;
  $('#lead-matrix').innerHTML = `<table class="matrix-tbl">${head}${body}${foot}</table>`;
}

function renderLeads() {
  const rows = currentLeadRows();
  const fmtDate = d => d ? `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}` : '<span class="cell-mute">—</span>';

  $('#leads-table tbody').innerHTML = rows.map(r => `
    <tr class="clickable" onclick="openLead('${r.id}')">
      <td><span class="badge ${r.group==='A'?'b-accent':'b-neutral'}">${r.group==='A'?'A 会員':'B 非会員'}</span></td>
      <td class="cell-mono">${r.id}</td>
      <td>
        ${r.name
          ? `<div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:26px;height:26px;font-size:10.5px">${r.name[0]}</div><div><div style="font-weight:500">${r.name}</div><div style="font-size:10.5px;color:var(--text-mute)">${r.seg||''}</div></div></div>`
          : `<div style="display:flex;align-items:center;gap:10px"><div style="width:26px;height:26px;border-radius:50%;background:var(--surface-2);display:grid;place-items:center;color:var(--text-mute)">${Icon('user',13)}</div><div><div style="color:var(--text-mute)">匿名（未登録）</div><div style="font-size:10.5px;color:var(--text-dim)">${r.email}</div></div></div>`}
      </td>
      <td>${r.eligible
        ? scoreBar(r)
        : `<span style="font-size:12px;color:var(--text-mute)">— <span class="badge b-neutral" style="margin-left:4px">対象外</span></span>`}</td>
      <td><span class="badge ${r.band.cls}">${r.band.label}</span></td>
      <td>${r.topProduct ? `<span style="font-size:12px">${r.topProduct}</span><div style="font-size:10px;color:var(--text-dim);font-family:monospace">${r.topSku}</div>` : '<span class="cell-mute">—</span>'}</td>
      <td class="cell-mute">${fmtDate(r.eligible ? r.lastInWin : r.lastAny)}</td>
    </tr>
  `).join('') || `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-mute)">該当なし</td></tr>`;

  const excluded = computeLeadRows({ windowMonths: LEAD_WINDOW }).filter(r => !r.eligible).length;
  $('#lead-count').textContent = `${rows.length} 件表示 ・ 対象外 ${excluded} 件`;
}

/* 効果測定：スコア帯 × 実購買 */
function renderReconcile() {
  const data = reconcileScoreToPurchase({ windowMonths: LEAD_WINDOW });
  const pct = v => (v * 100).toFixed(0) + '%';
  const maxCvr = Math.max(...data.map(d => d.cvr), 0.0001);
  $('#lead-reconcile').innerHTML = `
    <table class="matrix-tbl">
      <tr>
        <th style="text-align:left">スコア帯</th>
        <th style="text-align:center">リード数</th>
        <th style="text-align:center">購入者数</th>
        <th style="text-align:left;width:180px">購入率（CVR）</th>
        <th style="text-align:right">実売上</th>
      </tr>
      ${data.map(d => `
        <tr>
          <td><span class="badge ${d.key==='hot'?'b-danger':d.key==='warm'?'b-warn':'b-info'}">${d.label}</span></td>
          <td style="text-align:center">${d.leads}</td>
          <td style="text-align:center;font-weight:600">${d.buyers}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="flex:1;height:8px;border-radius:5px;background:var(--surface-2);overflow:hidden;display:block"><span style="display:block;height:100%;width:${(d.cvr/maxCvr*100)}%;background:${d.color}"></span></span>
              <span style="width:38px;text-align:right;font-weight:600;font-size:12px;color:${d.color}">${pct(d.cvr)}</span>
            </div>
          </td>
          <td style="text-align:right;font-weight:600">${yen(d.rev)}</td>
        </tr>
      `).join('')}
    </table>
    <div style="font-size:11px;color:var(--text-mute);margin-top:10px;line-height:1.5">
      ※ スコア付与後の実購買を <b>user識別子</b>（会員ID / ブラウザID）で突合。ホット帯ほど CVR・実売上が高いことを確認できます（スコアの妥当性検証）。
    </div>`;
}

function setLeadWindow(v) {
  LEAD_WINDOW = Number(v);
  const label = { 1:'直近1ヶ月', 2:'直近2ヶ月', 3:'直近3ヶ月', 6:'直近6ヶ月' }[LEAD_WINDOW];
  buildLeadProductFilter();
  renderLeadMatrix();
  renderLeads();
  renderReconcile();
  toast(`時間窓を${label}に変更 → 再計算しました`);
}

function jumpLead(group, band) {
  const g = $('#f-group'), b = $('#f-band'), p = $('#f-product');
  if (g) g.value = group;
  if (b) b.value = band;
  if (p) p.value = '';
  renderLeads();
  $('#content').scrollTo({ top: 360, behavior: 'smooth' });
}

function buildLeadProductFilter() {
  const sel = $('#f-product');
  if (!sel) return;
  const prev = sel.value;
  const skus = [...new Set(computeLeadRows({ windowMonths: LEAD_WINDOW }).map(r => r.topSku).filter(Boolean))];
  sel.innerHTML = `<option value="">全 関心商品</option>` +
    skus.map(s => `<option value="${s}">${PRODUCTS[s]}</option>`).join('');
  if (skus.includes(prev)) sel.value = prev;
}

function exportLeadsCSV() {
  const rows = currentLeadRows();
  const header = ['識別子','グループ','氏名','メール','配信可','スコア','スコア帯','行動内訳','関心商品ID','関心商品名','最終行動日','集計対象窓'];
  const fmtDate = d => d ? `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}` : '';
  const lines = rows.map(r => [
    r.id, r.group==='A'?'A:会員':'B:メール非会員', r.name||'(匿名)', r.email, r.optIn?'可':'不可',
    r.eligible ? r.total : '対象外', r.band.label,
    r.breakdown.map(b=>`${b.label}:${b.points}(${b.sku})`).join(' / '),
    r.topSku||'', r.topProduct||'', fmtDate(r.eligible ? r.lastInWin : r.lastAny),
    `直近${LEAD_WINDOW}ヶ月`
  ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
  const csv = '\uFEFF' + [header.join(','), ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leads_scoring_${LEAD_WINDOW}m.csv`;
  a.click();
  toast(`${rows.length} 件を CSV 出力しました`);
}

Object.assign(window, { renderLeads, renderLeadMatrix, renderReconcile, setLeadWindow, jumpLead, exportLeadsCSV, buildLeadProductFilter, currentLeadRows });

/* ===== Deals ===== */
function renderDeals() {
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
  $('#tasks-list').innerHTML = DATA.TASKS.map(t => `
    <div class="clickable" onclick="openTask(${t.id})" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--border-soft);cursor:pointer">
      <input type="checkbox" class="checkbox" onclick="event.stopPropagation()">
      <div style="width:3px;height:32px;border-radius:2px;background:${priBar[t.priority]}"></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${t.title}</div>
        <div style="font-size:11.5px;color:var(--text-mute);margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
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
  `).join('');
}

/* ===== Orders ===== */
function renderOrders() {
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
  const counts = { '配信中': 0, '予約': 0, '下書き': 0 };
  let rev = 0;
  DATA.CAMPAIGNS.forEach(c => {
    if (c.status in counts) counts[c.status]++;
    const n = parseInt(String(c.rev).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) rev += n;
  });
  $('#camp-stat-live').textContent = counts['配信中'];
  $('#camp-stat-scheduled').textContent = counts['予約'];
  $('#camp-stat-draft').textContent = counts['下書き'];
  $('#camp-stat-rev').textContent = '¥' + (rev / 1e6).toFixed(1) + 'M';
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

/* ===== Insights ===== */
function renderInsights() {
  $('#insights-list').innerHTML = DATA.INSIGHTS.map((i,idx) => renderInsightCard(i, idx, idx===0)).join('');
}

/* ===== Approvals ===== */
function renderApprovals() {
  const riskCls = {'高':'b-danger','中':'b-warn','低':'b-neutral'};
  $('#approvals-table tbody').innerHTML = DATA.APPROVALS.map((a,idx) => `
    <tr class="clickable" onclick="openApproval(${idx})">
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
function renderCharts() {
  if (chartsRendered) return;
  chartsRendered = true;
  const txt = '#767c95';
  const grid = 'rgba(20,21,42,.06)';

  new Chart($('#revenueChart'), {
    type: 'line',
    data: {
      labels: ['12月','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月'],
      datasets: [
        {label:'実績', data:[480,520,610,580,640,684,null,null,null,null,null,null],
          borderColor:'#6b5cff', backgroundColor:'rgba(107,92,255,.10)', fill:true, tension:.35, borderWidth:2, pointRadius:3, pointBackgroundColor:'#6b5cff'},
        {label:'AI 予測', data:[null,null,null,null,null,684,780,860,930,980,1020,1080],
          borderColor:'#06a89e', borderDash:[5,3], fill:false, tension:.35, borderWidth:2, pointRadius:0},
        {label:'目標', data:Array(12).fill(1000),
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
        backgroundColor:['#6b5cff','#06a89e','#2563eb','#d97706','#a4a8bd'],
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
    ['棶原','kajiwara@alion.jp','管理者'],
    ['山田（営業）','yamada@alion.jp','営業'],
    ['鈴木（CS）','suzuki@alion.jp','CS'],
    ['田中（開発）','tanaka@alion.jp','開発'],
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

  // Filter 「適用」 buttons
  $$('.filterbar .btn.primary').forEach(b => b.onclick = () => toast('フィルターを適用しました'));
}

/* ===== Boot ===== */
buildSidebar();
renderDashboard();
renderCustomers();
buildLeadProductFilter();
renderLeadMatrix();
renderLeads();
renderReconcile();
renderDeals();
renderTasks();
renderOrders();
renderInventory();
renderCampaigns();
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
