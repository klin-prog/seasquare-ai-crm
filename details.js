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
    <div style="padding:14px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:var(--surface-2)">
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

/* ===== Score breakdown / action history / nurture (items 7, 8, 10, 11) ===== */
function scoreBreakdownHTML(acts, score) {
  const rows = scoreRows(acts);
  return `
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid var(--border-soft)">
        <span style="font-size:11.5px;color:var(--text-mute)">スコア = Σ 行動ウェイト</span>
        <span style="font-size:18px;font-weight:700;color:var(--accent-hi)">${score}</span>
      </div>
      ${rows.map(r => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 14px;border-bottom:1px solid var(--border-soft);font-size:12.5px">
          <span style="color:var(--text-mute);display:grid;place-items:center;width:16px">${Icon(r.ic, 13)}</span>
          <span style="flex:1">${r.label}</span>
          <span style="font-weight:700;color:var(--accent-hi)">+${r.w}</span>
        </div>`).join('')}
    </div>`;
}
function actionHistoryHTML(acts, seed) {
  const rows = scoreRows(acts);
  const h = String(seed || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const days = ['今日', '昨日', '一昨日', '3日前', '4日前', '6日前', '9日前', '12日前'];
  return `<div style="font-size:12.5px;display:flex;flex-direction:column;gap:8px">
    ${rows.map((r, i) => {
      const hh = String(9 + ((h + i * 7) % 12)).padStart(2, '0');
      const mm = String((h * 3 + i * 17) % 60).padStart(2, '0');
      return `<div style="display:flex;gap:10px"><span class="cell-mono" style="color:var(--text-mute);flex-shrink:0;min-width:84px">${days[i] || (i + '日前')} ${hh}:${mm}</span><span>${r.label}</span></div>`;
    }).join('')}
  </div>`;
}
function nurtureHTML() {
  return `<div style="display:flex;flex-direction:column;gap:0">
    ${NURTURE.map((s, i) => `
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="min-width:50px;text-align:center;font-size:10.5px;font-weight:700;color:var(--accent-hi);background:var(--accent-bg);border-radius:6px;padding:3px 6px">${s.day}</div>
          ${i < NURTURE.length - 1 ? `<div style="width:1px;flex:1;min-height:22px;background:var(--border);margin:4px 0"></div>` : ''}
        </div>
        <div style="padding-bottom:14px">
          <div style="font-size:12.5px;font-weight:500">${s.label}</div>
          <div style="font-size:11px;color:var(--text-mute);margin-top:2px">${s.note}</div>
        </div>
      </div>`).join('')}
  </div>`;
}

/* AR/3D プレビュー（家具を部屋に試し置き・回転・部屋色切替・D23/4c） */
const AR_ROOMS = [
  { name:'ナチュラル', sw:'#e8e1d4', bg:'linear-gradient(160deg,#f3efe7,#e7ddcb 55%,#ddd0b8)', floor:'linear-gradient(180deg,rgba(150,120,70,.10),rgba(120,90,50,.18))' },
  { name:'グレー',     sw:'#e3e7f2', bg:'linear-gradient(160deg,#eef1f8,#e3e7f2 55%,#d9dde9)', floor:'linear-gradient(180deg,var(--accent-bg),var(--ai-bg))' },
  { name:'ウォーム',   sw:'#f1ddcd', bg:'linear-gradient(160deg,#fbf1e9,#f3e2d6 55%,#ecd3c2)', floor:'linear-gradient(180deg,rgba(217,119,6,.12),rgba(225,29,72,.10))' },
  { name:'ダーク',     sw:'#363a51', bg:'linear-gradient(160deg,#2b2e44,#23263a 60%,#1d2030)', floor:'linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02))' },
];
function setArRoom(i) {
  const r = AR_ROOMS[i]; if (!r) return;
  const room = document.getElementById('ar-room'), fl = document.getElementById('ar-floor');
  if (room) room.style.background = r.bg;
  if (fl) fl.style.background = r.floor;
}
window.setArRoom = setArRoom;
function arPreviewHTML(p) {
  const has3D = (p.ar || '').includes('3D'), hasAR = (p.ar || '').includes('AR');
  return `
    <div style="margin-bottom:14px">
      <div class="ar-room" id="ar-room">
        <div class="ar-floor" id="ar-floor"></div>
        <div class="ar-item" id="ar-item">${Icon('box', 46)}</div>
        <div class="ar-badges">
          ${has3D ? '<span class="badge b-accent">3D</span>' : ''}
          ${hasAR ? '<span class="badge b-info">AR</span>' : ''}
        </div>
        <div class="ar-tag">${p.cat} ・ お部屋プレビュー</div>
      </div>
      <div style="display:flex;align-items:center;gap:7px;margin-top:8px;flex-wrap:wrap">
        <span style="font-size:11px;color:var(--text-mute)">部屋:</span>
        ${AR_ROOMS.map((r, i) => `<button title="${r.name}" onclick="setArRoom(${i})" style="width:22px;height:22px;border-radius:6px;border:1px solid var(--border);cursor:pointer;padding:0;background:${r.sw}"></button>`).join('')}
        ${(has3D || hasAR) ? `<button class="btn ghost sm" style="margin-left:auto" onclick="document.getElementById('ar-item').classList.toggle('spin')">${Icon('refresh',11)} 360°回転</button>` : ''}
        ${hasAR ? `<button class="btn ai sm" onclick="toast('AR ビューを起動 ・ カメラで部屋に試し置き')">${Icon('box',12)} ARで試し置き</button>` : ''}
      </div>
    </div>`;
}

/* 検討ステージ（家具は長期検討・4c）— スコア/行動から現在地を推定 */
function considerStageHTML(c) {
  const stages = ['初回閲覧', 'AR体験', '比較検討', '相談', '購入'];
  const cur = c.score >= 90 ? 4 : c.score >= 75 ? 3 : c.score >= 55 ? 2 : (c.acts || []).includes('ar_view') ? 1 : 0;
  return `<div style="display:flex;align-items:flex-start;margin:2px 0 4px">
    ${stages.map((s, i) => `
      <div style="display:flex;align-items:center;${i < stages.length - 1 ? 'flex:1' : ''}">
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0">
          <div style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:700;${i <= cur ? 'background:var(--accent);color:#fff' : 'background:var(--surface-2);color:var(--text-mute);border:1px solid var(--border)'}">${i < cur ? '✓' : i + 1}</div>
          <span style="font-size:10px;color:${i <= cur ? 'var(--text)' : 'var(--text-mute)'};white-space:nowrap">${s}</span>
        </div>
        ${i < stages.length - 1 ? `<div style="flex:1;height:2px;margin:0 4px 18px;background:${i < cur ? 'var(--accent)' : 'var(--border)'}"></div>` : ''}
      </div>`).join('')}
  </div>`;
}

/* AI コーディネート提案（3点セット・家具EC固有・4c） */
function openCoordinate(id) {
  const c = DATA.CUSTOMERS.find(x => x.id === id);
  const set = ['SOFA-001', 'RUG-001', 'LAMP-001'].map(s => DATA.INVENTORY.find(p => p.sku === s)).filter(Boolean);
  const total = set.reduce((s, p) => s + p.price, 0);
  const setPrice = Math.round(total * 0.9 / 1000) * 1000;
  const arNote = c && (c.acts || []).includes('ar_view') ? 'AR で空間イメージを確認済みのため、設置後の質感が伝わる構成に。' : '';
  openModal({
    title: 'AI コーディネート提案',
    subtitle: c ? `${c.name} さま向け ・ リビング3点セット` : 'リビング3点セット',
    size: 'lg',
    icon: `<div style="width:36px;height:36px;border-radius:9px;background:var(--ai-bg);color:var(--ai);display:grid;place-items:center">${Icon('sparkles',18)}</div>`,
    body: `
      <div style="background:var(--accent-bg);border-radius:8px;padding:10px 12px;font-size:12.5px;color:var(--text-soft);margin-bottom:14px;line-height:1.7">
        ${c ? `${c.fseg}・スコア${c.score}の${c.name}さまに、` : ''}相性の良い3点を AI が選定。${arNote}統一感のあるナチュラルテイストで、セット購入なら <b style="color:var(--accent-hi)">10%OFF</b>。
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        ${set.map(p => `
          <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
            <div style="height:84px;background:linear-gradient(160deg,#eef1f8,#e3e7f2);display:grid;place-items:center;color:var(--brand-primary)">${Icon('box',28)}</div>
            <div style="padding:10px">
              <div style="font-size:12px;font-weight:600;line-height:1.4">${p.name}</div>
              <div style="font-size:11px;color:var(--text-mute);margin-top:2px">${p.cat}</div>
              <div style="font-size:12.5px;font-weight:700;margin-top:6px">${yen(p.price)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:12px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px">
        <div><span style="font-size:12px;color:var(--text-mute)">3点合計</span> <span style="text-decoration:line-through;color:var(--text-mute);margin-left:6px">${yen(total)}</span></div>
        <div style="font-size:20px;font-weight:700;color:var(--accent-hi)">${yen(setPrice)} <span style="font-size:11px;color:var(--success);font-weight:600;margin-left:4px">セット割10%</span></div>
      </div>`,
    footer: `
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn" onclick="toast('提案をPDF化')">${Icon('download',13)} PDF</button>
      <button class="btn ai" onclick="confirmDialog({title:'コーディネート提案を送付',body:'${c ? c.name + 'さま' : 'お客さま'}へ 3点セット提案を LINE 送付します。',confirmText:'送付',onConfirm:()=>{toast('提案を送付しました');closeModal()}})">${Icon('line',13)} LINEで提案を送付</button>
    `,
  });
}
window.openCoordinate = openCoordinate;

/* ===== Detail renderers ===== */
function openCustomer(id) {
  const c = DATA.CUSTOMERS.find(x => x.id === id);
  if (!c) return;
  DRAWER.open(`<div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:28px;height:28px;font-size:11px">${c.name[0]}</div><span>${c.name}</span></div>`, `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div class="cell-mono">${c.id}</div>
      <div style="display:flex;gap:6px;align-items:center">${fsegBadge(c.fseg)}${isSuppressed(c) ? suppBadge() : ''}</div>
    </div>
    ${Grid4(
      Tile('AI スコア', c.score, 'var(--accent-hi)') +
      Tile('LTV 予測', yen(c.ltv)) +
      Tile('累計購入', c.count+' 回') +
      Tile('チャネル', c.ch)
    )}
    ${SecLabel('検討ステージ')}
    ${considerStageHTML(c)}
    ${SecLabel('AI スコア内訳')}
    ${scoreBreakdownHTML(c.acts, c.score)}
    ${SecLabel('行動履歴')}
    ${actionHistoryHTML(c.acts, c.id)}
    <div style="display:flex;gap:10px;margin-top:8px;font-size:12px;color:var(--text-mute)"><span class="cell-mono" style="min-width:74px">${c.last}</span><span>前回購入</span></div>
    ${SecLabel('配信ステータス（過剰配信の抑制）')}
    <div style="background:${isSuppressed(c) ? 'var(--danger-bg)' : 'var(--surface-2)'};border:1px solid ${isSuppressed(c) ? 'rgba(225,29,72,.22)' : 'var(--border)'};border-radius:10px;padding:12px 14px;font-size:12.5px;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">最終配信日</span><span>${c.dlv ? c.dlv.last : '—'}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">今週の配信回数</span><span>${c.dlv ? c.dlv.week : 0} / 上限 ${c.dlv ? c.dlv.cap : 2} 回</span></div>
      ${isSuppressed(c)
        ? `<div style="color:var(--danger);font-weight:600;display:flex;align-items:center;gap:6px">${Icon('pause',12)} 配信頻度上限に到達 — 自動配信を抑制中</div>`
        : `<div style="color:var(--success);display:flex;align-items:center;gap:6px">${Icon('check',12)} 配信可能</div>`}
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
    <button class="btn lg" style="width:100%;justify-content:center;margin-top:8px" onclick="closeDrawer();openCoordinate('${c.id}')">${Icon('sparkles',13)} AI コーディネート提案</button>
    ${Actions([
      {label: Icon('mail',13)+' メール', onclick:`toast('メーラーを起動')`},
      {label: Icon('line',13)+' LINE', onclick:`toast('LINE トーク開く')`},
      {label: Icon('phone',13)+' 電話', onclick:`toast('発信')`},
    ])}
  `);
}

function openLead(id) {
  const l = DATA.LEADS.find(x => x.id === id);
  if (!l) return;
  DRAWER.open(`<div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:28px;height:28px;font-size:11px">${l.name[0]}</div><span>${l.name}</span><span style="margin-left:6px">${segBadge(l.seg)}</span></div>`, `
    ${Grid4(
      Tile('AI スコア', l.score, l.score>=90?'var(--danger)':l.score>=80?'var(--warn)':'var(--success)') +
      Tile('予測売上', yen(l.revenue)) +
      Tile('チャネル', l.ch) +
      Tile('優先度', l.score>=90?'高':l.score>=80?'中':'低')
    )}
    ${SecLabel('AI スコア内訳（何で何点か）')}
    ${scoreBreakdownHTML(l.acts, l.score)}
    ${SecLabel('直近行動')}
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:13px;line-height:1.6">${l.last}</div>
    ${SecLabel('育成シナリオ（日数ベース）')}
    ${nurtureHTML()}
    ${SecLabel('AI 推奨アクション')}
    <div class="insight" style="padding:14px">
      <div class="insight-ic">${Icon('sparkles',16)}</div>
      <div>
        <h4 style="font-size:13px">${l.action}</h4>
        <p style="font-size:12px">${(scoreRows(l.acts)[0] || {}).label || '直近行動'} など ${(l.acts || []).length} 件の高関与行動を検知。スコア ${l.score} ・ ${l.ch} が最適チャネル。</p>
        <div class="impact" style="font-size:11.5px;color:var(--success);margin-top:6px;font-weight:500">育成完了時 想定CV: ${Math.round(l.revenue/30000)}件 / ${yen(l.revenue)}（〜Day30）</div>
      </div>
    </div>
    ${SecLabel('生成メッセージプレビュー')}
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:12.5px;line-height:1.7;color:var(--text-soft)">
      ${l.name} 様<br><br>
      いつもご利用ありがとうございます。先日ご覧いただいた商品の詳細をご案内します。<br>
      AR で実際にお部屋に置いたイメージをご確認いただけます。<br><br>
      <span style="color:var(--accent-hi)">▶ AR で試し置きする</span>
    </div>
    <button class="btn primary lg" style="width:100%;justify-content:center;margin-top:14px" onclick="confirmDialog({title:'AI アクションを実行',body:'${l.name}さまへ「${l.action}」を実行します。',confirmText:'承認・実行',onConfirm:()=>{toast('${l.name}さまへアプローチ実行完了');closeDrawer();}})">承認・実行</button>
    ${Actions([
      {label:'メッセージを編集', onclick:`toast('編集モード')`},
      {label:'別チャネルへ', onclick:`toast('チャネル選択')`},
    ])}
  `);
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
      Field('担当者', CONFIG.user.name)
    )}
    ${t.customer!=='-' ? `${SecLabel('関連顧客')}<div style="background:var(--surface-2);padding:12px;border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;gap:10px"><div class="avatar" style="width:28px;height:28px;font-size:11px">${t.customer[0]}</div><span style="font-weight:500">${t.customer}</span></div>`:''}
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
      <button class="btn primary" onclick="completeTask(${t.id});closeDrawer()" style="justify-content:center">${Icon('check',13)} 完了にする</button>
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
    ${arPreviewHTML(p)}
    ${Grid4(
      Tile('価格', '¥'+(p.price/1000)+'K') +
      Tile('在庫', p.stock+' 点', stockColor) +
      Tile('月間閲覧', p.views) +
      Tile('CVR', p.cvr)
    )}
    ${SecLabel('在庫レベル')}
    <div style="background:var(--surface-2);padding:12px 14px;border-radius:10px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:12px;color:var(--text-mute)">現在の在庫</span><span style="font-weight:600;color:${stockColor}">${p.stock} 点</span></div>
      <div style="height:6px;background:var(--surface-2);border-radius:999px;overflow:hidden"><div style="height:100%;width:${stockPct}%;background:${stockColor};border-radius:999px"></div></div>
    </div>
    ${SecLabel('対応コンテンツ')}
    <div style="display:flex;gap:8px"><span class="badge b-accent">${p.ar}</span></div>
    ${p.advice!=='-' ? `${SecLabel('AI 推奨')}<div class="insight" style="padding:14px"><div class="insight-ic">${Icon('lightbulb',16)}</div><div><h4 style="font-size:13px">${p.advice}</h4><p style="font-size:12px">直近 7 日の閲覧+88%。在庫切迫リスクあり。発注ロット 20 点を推奨。</p></div></div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="toast('編集モード')" style="justify-content:center">${Icon('edit',13)} 編集</button>
      <button class="btn primary" onclick="closeDrawer();openPurchaseDraft('${p.sku}')" style="justify-content:center">${Icon('package',13)} 発注</button>
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
    ${isLive ? `${SecLabel('リアルタイム成果')}<div style="background:var(--surface-2);padding:14px;border-radius:10px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:11px;color:var(--text-mute)">売上貢献</div><div style="font-size:22px;font-weight:700;color:var(--success);margin-top:2px">${c.rev}</div></div><span class="badge b-success"><span class="b-dot"></span>配信中</span></div>`:''}
    ${SecLabel('配信設定')}
    <div style="display:flex;flex-direction:column;gap:10px;font-size:12.5px">
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">チャネル</span><span>${c.ch}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">対象セグメント</span><span>${c.target}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">配信日時</span><span>本日 18:00</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-mute)">作成者</span><span>${c.by}</span></div>
    </div>
    ${SecLabel('メッセージプレビュー')}
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:12.5px;line-height:1.7;color:var(--text-soft)">
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

function openDeal(c, t, a, src, stageKey) {
  const order = ['new', 'qualified', 'proposal', 'won'];
  const labels = { new: '新規', qualified: '検討中', proposal: '提案中', won: '受注' };
  const dates = ['5/15', '5/18', '5/22', '5/28'];
  const si = Math.max(0, order.indexOf(stageKey || 'qualified'));
  const probability = [55, 72, 84, 100][si];
  const next = {
    new:       { h: '初回ヒアリング → 検討中へ',         p: 'AR体験リンクを送付して関心度を測定。反応で確度を判定します。' },
    qualified: { h: '3D シミュレーション動画を送付',     p: '類似 VIP 顧客では動画送付後の成約率が +34%。提案中へ進めます。' },
    proposal:  { h: '見積＋設置事例を提示しクロージング', p: '設置イメージと納期を提示し、クロージング面談を設定して受注へ。' },
    won:       { h: '受注済み — アフターフォロー手配',   p: '設置日程とアフターサポートを自動で手配します。' },
  }[order[si]];
  const stBadge = si >= 3 ? 'b-success' : si >= 2 ? 'b-info' : si >= 1 ? 'b-warn' : 'b-neutral';
  const safeT = t.replace(/'/g, '');
  DRAWER.open(`商談`, `
    <div style="font-size:22px;font-weight:700;margin-bottom:4px">${yen(a)}</div>
    <div style="font-size:13px;color:var(--text-soft);margin-bottom:14px">${t}</div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <span class="badge ${src==='AI'?'b-ai':'b-neutral'}">${src==='AI'?'AI 生成':'手動'}</span>
      <span class="badge ${stBadge}">${labels[order[si]]}</span>
    </div>
    ${SecLabel('顧客')}
    <div style="background:var(--surface-2);padding:12px;border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;gap:10px"><div class="avatar" style="width:30px;height:30px;font-size:12px">${c[0]}</div><div><div style="font-weight:500">${c}</div><div style="font-size:11px;color:var(--text-mute)">顧客</div></div></div>
    ${Grid4(
      Tile('成約確度', probability+'%', 'var(--accent-hi)') +
      Tile('予測 GP', '¥'+Math.round(a*0.3/1000)+'K') +
      Tile('ステージ', labels[order[si]]) +
      Tile('担当', CONFIG.user.name)
    )}
    ${SecLabel('ステージ履歴')}
    ${Timeline(order.map((k, i) => ({ label: labels[k] + (i < si ? ' ・ 完了' : i === si ? ' ・ 進行中' : ''), time: i <= si ? dates[i] : null, done: i < si, active: i === si })))}
    ${SecLabel('AI 次の一手')}
    <div class="insight" style="padding:14px">
      <div class="insight-ic">${Icon('sparkles',16)}</div>
      <div><h4 style="font-size:13px">${next.h}</h4><p style="font-size:12px">${next.p}</p></div>
    </div>
    ${si < 3
      ? `<button class="btn primary lg" style="width:100%;justify-content:center;margin-top:14px" onclick="advanceDeal('${c}','${safeT}','${order[si]}')">${Icon('arrowUp',13)} 次ステージ「${labels[order[si + 1]]}」へ進める</button>`
      : `<div style="margin-top:14px;padding:12px;background:var(--success-bg);border:1px solid rgba(22,163,74,.2);border-radius:10px;color:var(--success);font-size:12.5px;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px">${Icon('check',13)} 受注完了 — アフターフォロー手配済み</div>`}
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
    <div style="font-size:12.5px;line-height:1.7;color:var(--text-soft);background:var(--surface-2);padding:14px;border-radius:10px;border:1px solid var(--border)">
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
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:12.5px;line-height:1.7">${a.reason}</div>
    ${SecLabel('実行内容プレビュー')}
    <div style="background:var(--surface-2);border:1px dashed var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.6;color:var(--text-soft)">
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
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--text-soft);word-break:break-all">${l.input}</div>
    ${SecLabel('結果')}
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:${l.status==='error'?'var(--danger)':'var(--text-soft)'};word-break:break-all">${l.result}</div>
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
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px"><span style="font-size:12.5px">エンドポイント</span><span class="cell-mono">api.${name.toLowerCase().replace(/\\s/g,'')}.com</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px"><span style="font-size:12.5px">API キー</span><span class="cell-mono">••••••••${Math.floor(Math.random()*9999)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px"><span style="font-size:12.5px">自動同期</span><span class="badge b-success">5 分ごと</span></div>
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
        <label style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;font-size:12.5px;cursor:pointer">
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

const REPORT_DATA = {
  '商談 AI スコアリング分析': {
    summary: 'AIスコアの予測精度は87%。スコア85以上のリードの実成約率は42%で全体平均(18%)の2.3倍。AR・マイルーム行動を持つ層で特に高精度。',
    metrics: [['予測精度(AUC)','0.87','+0.04','var(--success)'],['スコア85+ 成約率','42%','+6pt','var(--success)'],['平均リードタイム','19日','-3日','var(--success)'],['誤検知率','7.2%','-1.1pt','var(--success)']],
  },
  'キャンペーン効果分析': {
    summary: 'LINEはメールに対し開封率+24pt・CV率+1.8pt。母の日リピート訴求がCV8件/¥640,000で最高。配信解除率は0.6%と健全。',
    metrics: [['LINE 開封率','72.4%','+24pt','var(--success)'],['メール 開封率','48.1%','+3pt','var(--success)'],['平均 CV率','5.2%','+0.6pt','var(--success)'],['配信解除率','0.6%','-0.2pt','var(--success)']],
  },
  'CV 経路分析': {
    summary: 'AR体験を経由した購入は全体の38%、非経由比でCVRが2.1倍。LINE→AR→カートが最短動線。離脱は価格比較ページに集中。',
    metrics: [['AR経由 CV比率','38%','+9pt','var(--success)'],['AR経由 CVR','12.4%','+6.6pt','var(--success)'],['平均接触回数','4.2回','+0.3','var(--text)'],['価格ページ離脱率','41%','+2pt','var(--danger)']],
  },
  '商品売れ筋・滞留': {
    summary: 'ソファ・ダイニングで売上の62%。ナチュラルウッドダイニングは在庫回転2.4回/月で要補充。リネンカーテンは滞留(回転0.4)。',
    metrics: [['売れ筋トップ','ソファ','—','var(--text)'],['最高回転','ダイニング 2.4','+0.5','var(--success)'],['滞留 SKU','カーテン 0.4','-0.1','var(--danger)'],['在庫切迫','3 SKU','+1','var(--warn)']],
  },
  'LTV コホート分析': {
    summary: '2024Q2獲得コホートの12ヶ月LTVが¥186,000で最高。LINE獲得層はEC獲得層よりLTV+38%。獲得後6ヶ月のVIP化率は14%。',
    metrics: [['最高LTVコホート','24Q2','—','var(--text)'],['12ヶ月平均LTV','¥186,000','+12%','var(--success)'],['LINE層 LTV差','+38%','+5pt','var(--success)'],['VIP化率(6ヶ月)','14%','+2pt','var(--success)']],
  },
};
function openReport(title) {
  const k = window.getMetrics ? getMetrics() : { actual:6840000, target:10000000, forecast:9200000, momGrowth:14.2, achievement:.684, projected:.92 };
  const rep = REPORT_DATA[title];
  const summary = rep ? rep.summary : `今月の売上は ${yen(k.actual)} で前月比 +${k.momGrowth.toFixed(1)}%。VIP・リピート顧客の購買が牽引し、AI 接客経由の注文が全体の 58% を占めています。AI 予測では月末 ${yenM(k.forecast)} 着地、目標達成率 ${(k.projected*100).toFixed(0)}%（達成率 ${(k.achievement*100).toFixed(1)}%）。`;
  const metrics = rep ? rep.metrics : [['EC 売上',yenM(k.actual),'+'+k.momGrowth.toFixed(1)+'%','var(--success)'],['平均単価','¥41,200','+8.4%','var(--success)'],['CVR','4.8%','-0.3%','var(--danger)'],['AI 接客率','58%','+12%','var(--success)']];
  const seriesMap = {
    '商談 AI スコアリング分析': { label:'予測精度 (AUC)', data:[0.79,0.82,0.84,0.85,0.86,0.87] },
    'キャンペーン効果分析':     { label:'平均CV率 (%)',  data:[3.6,4.1,4.4,4.8,5.0,5.2] },
    'CV 経路分析':             { label:'AR経由CVR (%)', data:[8.1,9.4,10.2,11.0,11.8,12.4] },
    '商品売れ筋・滞留':         { label:'トップ商品 回転', data:[1.9,2.0,2.1,2.2,2.3,2.4] },
    'LTV コホート分析':        { label:'平均LTV (千円)', data:[121,138,150,162,175,186] },
  };
  const sc = seriesMap[title] || { label:'月商 (万円)', data:[520,610,580,640,684,720] };
  DRAWER.open(`レポート: ${title}`, `
    <div style="font-size:12px;color:var(--text-mute);margin-bottom:14px">2026 年 5 月度</div>
    ${Grid4(
      Tile('対象期間', '5/1-20') +
      Tile('生成', 'AI') +
      Tile('行数', '12,438') +
      Tile('鮮度', 'Live')
    )}
    ${SecLabel('サマリー')}
    <div style="font-size:12.5px;line-height:1.7;color:var(--text-soft)">${summary}</div>
    ${SecLabel('主要指標')}
    <div style="display:flex;flex-direction:column;gap:8px">
      ${metrics.map(([l,v,d,c])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;font-size:12.5px">
          <span>${l}</span>
          <div><span style="font-weight:600">${v}</span> <span style="color:${c};margin-left:8px;font-size:11.5px">${d}</span></div>
        </div>
      `).join('')}
    </div>
    ${SecLabel('推移')}
    <div style="height:160px"><canvas id="report-chart"></canvas></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px">
      <button class="btn" onclick="toast('PDF を出力')" style="justify-content:center">${Icon('download',13)} PDF</button>
      <button class="btn primary" onclick="toast('全画面で表示')" style="justify-content:center">詳細を表示</button>
    </div>
  `);
  if (window.Chart) {
    if (window.__reportChart) { try { window.__reportChart.destroy(); } catch (e) {} }
    const cv = document.getElementById('report-chart');
    if (cv) window.__reportChart = new Chart(cv, {
      type: 'line',
      data: { labels: ['12月','1月','2月','3月','4月','5月'], datasets: [{ label: sc.label, data: sc.data, borderColor: CONFIG.brand.primary, backgroundColor: _hexToRgba(CONFIG.brand.primary, .12), fill: true, tension: .35, borderWidth: 2, pointRadius: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#767c95', font: { size: 10 } }, grid: { color: 'rgba(20,21,42,.06)' } }, y: { ticks: { color: '#767c95', font: { size: 10 } }, grid: { color: 'rgba(20,21,42,.06)' } } } }
    });
  }
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
