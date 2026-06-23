/* ===== Modal system (top-level dialogs) ===== */
function openModal(opts) {
  const { title, body, footer, size = 'md', subtitle, icon } = opts;
  closeModal();
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.id = '__modal';
  wrap.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal()"></div>
    <div class="modal modal-${size}" role="dialog">
      <div class="modal-head">
        <div style="display:flex;align-items:center;gap:10px;min-width:0">
          ${icon ? `<div class="modal-icon">${icon}</div>` : ''}
          <div style="min-width:0">
            <div class="modal-title">${title}</div>
            ${subtitle ? `<div class="modal-sub">${subtitle}</div>` : ''}
          </div>
        </div>
        <button class="icon-btn" onclick="closeModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>
  `;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
}
function closeModal() {
  const m = document.getElementById('__modal');
  if (m) m.remove();
}
window.openModal = openModal;
window.closeModal = closeModal;
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); } });

/* ===== Top-bar actions ===== */
function openSettings() {
  openModal({
    title: '個人設定',
    subtitle: 'プロファイルとアラート',
    icon: `<div class="avatar" style="width:36px;height:36px">${CONFIG.user.initial}</div>`,
    size: 'md',
    body: `
      <div style="display:flex;flex-direction:column;gap:14px">
        <label class="form-row"><span class="form-lab">表示名</span><input class="input" value="${CONFIG.user.name}" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">メール</span><input class="input" value="${CONFIG.user.email}" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">タイムゾーン</span><select class="select" style="flex:1"><option>Asia/Tokyo (UTC+9)</option><option>America/Los_Angeles</option></select></label>
        <label class="form-row" style="align-items:flex-start"><span class="form-lab" style="padding-top:6px">通知</span>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px">
            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px"><input type="checkbox" class="checkbox" checked> AI 承認待ち</label>
            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px"><input type="checkbox" class="checkbox" checked> 在庫切迫アラート</label>
            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px"><input type="checkbox" class="checkbox"> 高スコアリード新着</label>
          </div>
        </label>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn ghost" onclick="confirmDialog({title:'デモをリセット',body:'承認・タスク・商談などの変更を初期状態に戻します。',kind:'danger',confirmText:'リセット',onConfirm:resetDemo})">デモをリセット</button>
      <button class="btn primary" onclick="toast('設定を保存しました');closeModal()">保存</button>
    `,
  });
}

function openNotifications() {
  DRAWER.open('通知', `
    <div style="padding:16px 20px 0 20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600">未読 (3)</div>
        <button class="btn ghost sm" onclick="toast('すべて既読')">すべて既読</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="notif unread" onclick="closeDrawer();nav('approvals')">
          <div class="notif-ic" style="background:var(--ai-bg);color:var(--ai)">${Icon('sparkles',14)}</div>
          <div style="flex:1"><div style="font-size:12.5px;font-weight:500">AI 承認待ち 4 件があります</div><div style="font-size:11px;color:var(--text-mute);margin-top:2px">5 分前</div></div>
        </div>
        <div class="notif unread" onclick="closeDrawer();showInventoryAlert()">
          <div class="notif-ic" style="background:var(--danger-bg);color:var(--danger)">${Icon('box',14)}</div>
          <div style="flex:1"><div style="font-size:12.5px;font-weight:500">在庫切迫: ナチュラルウッドダイニング 残 3 点</div><div style="font-size:11px;color:var(--text-mute);margin-top:2px">15 分前</div></div>
        </div>
        <div class="notif unread" onclick="closeDrawer();nav('leads')">
          <div class="notif-ic" style="background:var(--accent-bg);color:var(--accent-hi)">${Icon('flame',14)}</div>
          <div style="flex:1"><div style="font-size:12.5px;font-weight:500">高スコアリード 3 名が新着</div><div style="font-size:11px;color:var(--text-mute);margin-top:2px">1 時間前</div></div>
        </div>
      </div>
    </div>
    <div style="padding:18px 20px">
      <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:12px">過去 24 時間</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="notif">
          <div class="notif-ic" style="background:var(--success-bg);color:var(--success)">${Icon('check',14)}</div>
          <div style="flex:1"><div style="font-size:12.5px">母の日キャンペーン CV 8 件達成</div><div style="font-size:11px;color:var(--text-mute);margin-top:2px">昨日 16:42</div></div>
        </div>
        <div class="notif">
          <div class="notif-ic" style="background:var(--info-bg);color:var(--info)">${Icon('mail',14)}</div>
          <div style="flex:1"><div style="font-size:12.5px">休眠顧客 48 名へリエンゲージメール送信完了</div><div style="font-size:11px;color:var(--text-mute);margin-top:2px">昨日 09:00</div></div>
        </div>
      </div>
    </div>
  `, 440);
}

function openSearchPalette() {
  openModal({
    title: 'グローバル検索',
    size: 'lg',
    body: `
      <div style="position:relative;margin-bottom:14px">
        <input class="input" placeholder="顧客・商品・商談・タスクを検索 ..." style="width:100%;height:40px;padding-left:36px;font-size:13px" autofocus>
        <span style="position:absolute;left:12px;top:12px;color:var(--text-mute);pointer-events:none">${Icon('search',14)}</span>
      </div>
      <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;font-weight:600">クイックアクセス</div>
      <div style="display:flex;flex-direction:column;gap:2px">
        <button class="search-item" onclick="closeModal();openCustomer('CST-008')">
          <span style="color:var(--text-mute)">${Icon('users',14)}</span>
          <span style="flex:1;text-align:left"><div style="font-size:13px;font-weight:500">中村 健太郎</div><div style="font-size:11px;color:var(--text-mute)">顧客 / VIP / LTV ¥1,240,000</div></span>
          <span style="color:var(--text-mute);font-size:11px">⏎</span>
        </button>
        <button class="search-item" onclick="closeModal();openProduct('SOFA-001')">
          <span style="color:var(--text-mute)">${Icon('box',14)}</span>
          <span style="flex:1;text-align:left"><div style="font-size:13px;font-weight:500">モダンコーナーソファ ベージュ</div><div style="font-size:11px;color:var(--text-mute)">商品 / SOFA-001 / ¥189,000</div></span>
          <span style="color:var(--text-mute);font-size:11px">⏎</span>
        </button>
        <button class="search-item" onclick="closeModal();openOrder('ORD-26052001')">
          <span style="color:var(--text-mute)">${Icon('package',14)}</span>
          <span style="flex:1;text-align:left"><div style="font-size:13px;font-weight:500">ORD-26052001</div><div style="font-size:11px;color:var(--text-mute)">注文 / 佐藤 美咲 / ¥189,000</div></span>
          <span style="color:var(--text-mute);font-size:11px">⏎</span>
        </button>
        <button class="search-item" onclick="closeModal();openCampaign('母の日リピート訴求')">
          <span style="color:var(--text-mute)">${Icon('mail',14)}</span>
          <span style="flex:1;text-align:left"><div style="font-size:13px;font-weight:500">母の日リピート訴求</div><div style="font-size:11px;color:var(--text-mute)">キャンペーン / 配信中</div></span>
          <span style="color:var(--text-mute);font-size:11px">⏎</span>
        </button>
      </div>
    `,
  });
}

/* ===== New-item modals ===== */
function openNewTaskModal() {
  openModal({
    title: '新規タスク作成',
    size: 'md',
    icon: `<div style="width:36px;height:36px;border-radius:9px;background:var(--accent-bg);color:var(--accent-hi);display:grid;place-items:center">${Icon('check',18)}</div>`,
    body: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="form-row"><span class="form-lab">タイトル</span><input class="input" placeholder="例: 顧客フォロー" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">関連顧客</span><input class="input" placeholder="顧客を検索 ..." style="flex:1"></label>
        <label class="form-row"><span class="form-lab">期日</span><input class="input" type="date" value="2026-05-25" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">優先度</span><select class="select" style="flex:1"><option>高</option><option selected>中</option><option>低</option></select></label>
        <label class="form-row" style="align-items:flex-start"><span class="form-lab" style="padding-top:8px">メモ</span><textarea class="input" rows="3" style="flex:1;padding:8px 11px;resize:vertical"></textarea></label>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn ai" onclick="toast('AI が下書きを生成中 ...')">${Icon('sparkles',13)} AI が下書き</button>
      <button class="btn primary" onclick="toast('タスクを作成しました');closeModal()">作成</button>
    `,
  });
}

function openNewCustomerModal() {
  openModal({
    title: '新規顧客を登録',
    size: 'md',
    body: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="form-row"><span class="form-lab">氏名</span><input class="input" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">メール</span><input class="input" type="email" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">電話</span><input class="input" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">チャネル</span><select class="select" style="flex:1"><option>EC</option><option>LINE</option><option>店舗</option><option>広告</option></select></label>
        <label class="form-row"><span class="form-lab">セグメント</span><select class="select" style="flex:1"><option>新規</option><option>リピート</option><option>VIP</option></select></label>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn primary" onclick="toast('顧客を登録しました');closeModal()">登録</button>
    `,
  });
}

function openNewDealModal() {
  openModal({
    title: '新規商談を作成',
    size: 'md',
    body: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="form-row"><span class="form-lab">顧客</span><input class="input" placeholder="顧客検索 ..." style="flex:1"></label>
        <label class="form-row"><span class="form-lab">商談名</span><input class="input" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">予算</span><input class="input" placeholder="¥" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">ステージ</span><select class="select" style="flex:1"><option>新規</option><option>検討中</option><option>提案中</option></select></label>
        <label class="form-row"><span class="form-lab">クローズ予定</span><input class="input" type="date" style="flex:1"></label>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn ai" onclick="toast('AI が商談を分析')">${Icon('sparkles',13)} AI 分析</button>
      <button class="btn primary" onclick="toast('商談を作成しました');closeModal()">作成</button>
    `,
  });
}

function openNewCampaignModal() {
  openModal({
    title: '新規キャンペーン',
    size: 'md',
    body: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="form-row"><span class="form-lab">名称</span><input class="input" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">チャネル</span><select class="select" style="flex:1"><option>LINE</option><option>メール</option><option>両方</option></select></label>
        <label class="form-row"><span class="form-lab">対象</span><select class="select" style="flex:1"><option>全員</option><option>VIP</option><option>休眠</option><option>新規</option></select></label>
        <label class="form-row"><span class="form-lab">配信日時</span><input class="input" type="datetime-local" style="flex:1"></label>
        <label class="form-row" style="align-items:flex-start"><span class="form-lab" style="padding-top:8px">内容</span><textarea class="input" rows="4" style="flex:1;padding:8px 11px;resize:vertical" placeholder="メッセージ内容 ..."></textarea></label>
        <div style="background:var(--accent-bg);border-radius:8px;padding:10px;font-size:12px;color:var(--accent-hi);display:flex;align-items:center;gap:8px">
          ${Icon('sparkles',13)} AI が対象セグメントに合わせて内容を自動生成
          <button class="btn ai sm" style="margin-left:auto" onclick="toast('AI が下書きを生成中 ...')">生成</button>
        </div>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn" onclick="toast('下書き保存')">下書き保存</button>
      <button class="btn primary" onclick="toast('キャンペーンを予約配信');closeModal()">予約配信</button>
    `,
  });
}

function openNewProductModal() {
  openModal({
    title: '商品を追加',
    size: 'md',
    body: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="form-row"><span class="form-lab">SKU</span><input class="input" placeholder="例: SOFA-002" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">商品名</span><input class="input" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">カテゴリ</span><select class="select" style="flex:1"><option>ソファ</option><option>テーブル</option><option>チェア</option><option>照明</option><option>ラグ</option><option>カーテン</option></select></label>
        <label class="form-row"><span class="form-lab">価格</span><input class="input" type="number" placeholder="¥" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">在庫</span><input class="input" type="number" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">3D / AR</span><select class="select" style="flex:1"><option>なし</option><option>3D</option><option>AR</option><option>3D+AR</option></select></label>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn primary" onclick="toast('商品を追加');closeModal()">追加</button>
    `,
  });
}

function openNewUserModal() {
  openModal({
    title: 'ユーザーを追加',
    size: 'md',
    body: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="form-row"><span class="form-lab">氏名</span><input class="input" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">メール</span><input class="input" type="email" placeholder="@seasquare.co.jp" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">権限</span><select class="select" style="flex:1"><option>管理者</option><option>営業</option><option>CS</option><option>開発</option><option>閲覧のみ</option></select></label>
        <label class="form-row"><span class="form-lab">AI 実行</span><select class="select" style="flex:1"><option>承認後に実行</option><option>すべての AI を実行可能</option><option>不可</option></select></label>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn primary" onclick="toast('招待メールを送信しました');closeModal()">招待を送信</button>
    `,
  });
}

function openUserEdit(name) {
  const presets = {
    [CONFIG.user.name]: { email: CONFIG.user.email.split('@')[0], role: CONFIG.user.role, ai: 'すべての AI を実行可能' },
    '山田（営業）': { email: 'yamada',   role: '営業',    ai: '承認後に実行' },
    '鈴木（CS）':   { email: 'suzuki',   role: 'CS',     ai: '承認後に実行' },
    '田中（開発）': { email: 'tanaka',   role: '開発',    ai: 'すべての AI を実行可能' },
  };
  const p = presets[name] || { email: '', role: '営業', ai: '承認後に実行' };
  openModal({
    title: `${name} を編集`,
    subtitle: '権限・AI 実行ポリシー',
    icon: `<div class="avatar" style="width:36px;height:36px">${name[0]}</div>`,
    size: 'md',
    body: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <label class="form-row"><span class="form-lab">氏名</span><input class="input" value="${name}" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">メール</span><input class="input" value="${p.email}@seasquare.co.jp" style="flex:1"></label>
        <label class="form-row"><span class="form-lab">権限</span>
          <select class="select" style="flex:1">
            ${['管理者','営業','CS','開発','閲覧のみ'].map(r => `<option ${r===p.role?'selected':''}>${r}</option>`).join('')}
          </select>
        </label>
        <label class="form-row"><span class="form-lab">AI 実行</span>
          <select class="select" style="flex:1">
            ${['すべての AI を実行可能','承認後に実行','不可'].map(a => `<option ${a===p.ai?'selected':''}>${a}</option>`).join('')}
          </select>
        </label>
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">キャンセル</button>
      <button class="btn danger" onclick="confirmDialog({title:'ユーザーを無効化',body:'再有効化まで全機能停止します。',kind:'danger',confirmText:'無効化',onConfirm:()=>{toast('無効化しました');closeModal()}})">無効化</button>
      <button class="btn primary" onclick="toast('変更を保存しました');closeModal()">保存</button>
    `,
  });
}

/* ===== Connection / integration ===== */
function newConnection() {
  openModal({
    title: '新規接続',
    subtitle: '連携先を選択',
    icon: `<div style="width:36px;height:36px;border-radius:9px;background:var(--accent-bg);color:var(--accent-hi);display:grid;place-items:center">${Icon('plug',18)}</div>`,
    size: 'md',
    body: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${['Slack','Salesforce','Stripe','Shopify','HubSpot','Notion','Zendesk','Mailchimp','Twilio'].map(s => `
          <button class="btn" style="height:64px;flex-direction:column;gap:4px;padding:0" onclick="toast('${s} の OAuth を開始');closeModal()">
            <div style="font-weight:600;font-size:13px">${s}</div>
            <div style="font-size:10.5px;color:var(--text-mute);font-weight:400">接続する</div>
          </button>
        `).join('')}
      </div>
    `,
    footer: `<button class="btn ghost" onclick="closeModal()">閉じる</button>`,
  });
}

/* ===== Analytics ===== */
// 自然言語クエリ → キーワードで出し分け（4b）
const QUERY_SETS = [
  { kw:['休眠','離脱','チャーン','リエンゲージ','再購入'], q:'休眠顧客の再購入見込み',
    sql:"SELECT segment, COUNT(*) AS users, AVG(repurchase_rate) AS rate\nFROM customers\nWHERE last_order_date < DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)\nGROUP BY segment\nORDER BY rate DESC;",
    cols:['セグメント','人数','再購入率'], rows:[['離脱(1年+)','1,204','3.1%'],['離脱リスク','862','8.4%'],['リピート育成中','540','22.6%']],
    note:'リピート育成中は再購入率が高い。優先的に育成シナリオへ載せるのが有効。' },
  { kw:['在庫','発注','回転','velocity','補充'], q:'在庫回転と発注推奨',
    sql:"WITH velocity AS (\n  SELECT sku, SUM(qty)/30.0 AS per_day FROM orders\n  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) GROUP BY sku )\nSELECT i.sku, ROUND(v.per_day*30,1) AS turn, i.stock\nFROM inventory i JOIN velocity v USING(sku) ORDER BY turn DESC;",
    cols:['SKU','回転/月','在庫'], rows:[['TABLE-001','2.4','3'],['SOFA-001','1.8','8'],['CURTAIN-001','0.4','80']],
    note:'TABLE-001 は要発注（在庫3）、CURTAIN-001 は滞留（回転0.4）。' },
  { kw:['AR','3D','マイルーム','体験'], q:'AR体験とCVの相関',
    sql:"SELECT ar_used, ROUND(AVG(cv),3) AS cvr, ROUND(AVG(aov)) AS aov\nFROM sessions\nGROUP BY ar_used ORDER BY cvr DESC;",
    cols:['AR体験','CVR','客単価'], rows:[['あり','12.4%','¥168,000'],['なし','5.8%','¥92,000']],
    note:'AR体験ありは CVR 2.1倍・客単価 1.8倍。AR導線の強化が有効。' },
  { kw:['LTV','コホート','獲得'], q:'獲得月別 12ヶ月LTV',
    sql:"SELECT cohort_month, ROUND(AVG(ltv_12m)) AS ltv, channel\nFROM cohorts\nGROUP BY cohort_month, channel ORDER BY ltv DESC LIMIT 5;",
    cols:['獲得月','12ヶ月LTV','チャネル'], rows:[['2024-04','¥186,000','LINE'],['2024-02','¥162,000','LINE'],['2024-05','¥121,000','EC']],
    note:'LINE獲得層のLTVが高い。獲得チャネル配分の見直し余地あり。' },
  { kw:[], q:'ソファカテゴリ 閲覧TOP3',
    sql:"SELECT product_name, SUM(views) AS total, ROUND(AVG(cvr),3) AS cvr\nFROM access_logs\nWHERE category='ソファ' AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)\nGROUP BY product_name ORDER BY total DESC LIMIT 3;",
    cols:['商品名','閲覧数','CVR'], rows:[['モダンコーナーソファ','1,240','8.2%'],['北欧2人掛けソファ','842','6.4%'],['リクライニングソファ','612','5.8%']],
    note:'モダンコーナーソファが突出。在庫8点、補充を検討。' },
];
function streamText(elId, text, done) {
  let i = 0;
  (function t() {
    const el = document.getElementById(elId); if (!el) return;
    const v = text.slice(0, i);
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') el.value = v; else el.textContent = v;
    if (i++ < text.length) setTimeout(t, 13); else if (done) done();
  })();
}
function runAnalyticsQuery() {
  const inp = document.querySelector('#view-analytics input.input');
  const qstr = (inp && inp.value.trim()) || '';
  const s = QUERY_SETS.find(x => x.kw.some(k => qstr.includes(k))) || QUERY_SETS[QUERY_SETS.length - 1];
  openModal({
    title: 'AI 分析結果', subtitle: qstr || s.q, size: 'lg',
    icon: `<div style="width:36px;height:36px;border-radius:9px;background:var(--ai-bg);color:var(--ai);display:grid;place-items:center">${Icon('sparkles',18)}</div>`,
    body: `
      <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:8px">AI が生成した SQL</div>
      <div id="__sqlbox" style="background:#0f1018;color:#e8e9f1;border-radius:8px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.7;margin-bottom:18px;min-height:92px;white-space:pre-wrap"></div>
      <div id="__qres" style="opacity:0;transition:opacity .45s">
        <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:8px">結果</div>
        <table class="tbl" style="border:1px solid var(--border);border-radius:8px;overflow:hidden">
          <thead><tr>${s.cols.map((c, i) => `<th style="text-align:${i ? 'right' : 'left'}">${c}</th>`).join('')}</tr></thead>
          <tbody>${s.rows.map(r => `<tr>${r.map((v, i) => `<td style="text-align:${i ? 'right' : 'left'};${i ? 'font-weight:600' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <div style="margin-top:12px;background:var(--ai-bg);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--text-soft);display:flex;gap:8px"><span style="color:var(--ai)">${Icon('sparkles',13)}</span><span>${s.note}</span></div>
        <div style="margin-top:10px;font-size:11.5px;color:var(--text-mute)">実行時間: 1.4 秒 ・ スキャン: 24,182 行 ・ コスト: ¥4.2</div>
      </div>`,
    footer: `
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn" onclick="toast('CSV をダウンロード中')">${Icon('download',13)} CSV</button>
      <button class="btn primary" onclick="toast('ダッシュボードに追加');closeModal()">ダッシュボードに追加</button>
    `,
  });
  streamText('__sqlbox', s.sql, () => { const r = document.getElementById('__qres'); if (r) r.style.opacity = '1'; });
}

/* ===== Bulk / mass actions ===== */
/* applyCustomerFilter は app.js に実装（家具セグメントで実フィルタ・item 9） */

function recalcLeadScore() {
  toast('AI スコア再計算中 ...');
  setTimeout(() => { if (window.renderLeads) renderLeads(); toast('再計算完了 ・ 1.8 秒'); }, 900);
}

function bulkAIApproach() {
  confirmDialog({
    title: '7 名へ AI 一括アプローチ',
    body: '高スコアリード 7 名にパーソナライズメッセージを送信します。送信前に AI が内容を最適化します。',
    confirmText: '実行',
    onConfirm: () => toast('7 名へ送信完了'),
  });
}

function bulkApproveAll() {
  const n = DATA.APPROVALS.length;
  if (!n) return toast('承認待ちはありません');
  confirmDialog({ title: 'すべての提案を承認', body: `${n} 件の AI 提案をまとめて承認・実行します。`, confirmText: 'すべて承認', onConfirm: () => resolveAllApprovals(true) });
}

function bulkRejectAll() {
  const n = DATA.APPROVALS.length;
  if (!n) return toast('承認待ちはありません');
  confirmDialog({ title: 'すべての提案を却下', body: `${n} 件の AI 提案をすべて却下します。`, kind: 'danger', confirmText: 'すべて却下', onConfirm: () => resolveAllApprovals(false) });
}

function refreshDashboard() {
  const btn = document.querySelector('#view-dashboard .page-head .btn:not(.primary)');
  if (btn) { btn.disabled = true; btn.style.opacity = '.55'; btn.style.pointerEvents = 'none'; }
  toast('データを再読込中 ...');
  setTimeout(() => {
    perturbMetrics();      // 数値を ±数% で微変動（item 5）
    renderKPIs();          // KPI を再描画
    updateRevenueChart();  // チャートも同じ値で同期（item 6）
    refreshGreeting();     // 時間帯表示も更新（item 4）
    pushStreamRow();       // ライブストリームに新着を1件追加
    if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.style.pointerEvents = ''; }
    toast('最新化完了');
  }, 700);
}

function exportCSV(label) {
  toast(`${label} を CSV エクスポート中 ...`);
  setTimeout(() => toast(`${label}.csv をダウンロード`), 700);
}

function printOrderLabels() {
  confirmDialog({
    title: '配送伝票を印刷',
    body: '本日分の配送伝票 14 件を印刷キューに送信します。',
    confirmText: '印刷',
    onConfirm: () => toast('印刷キューへ送信完了'),
  });
}

function regenerateInsights() {
  toast('AI が再分析中 ...');
  setTimeout(() => toast('AI 提案を更新しました'), 1200);
}

function showInventoryAlert() {
  openModal({
    title: '在庫切迫アラート',
    subtitle: '3 件が AI 発注推奨',
    size: 'md',
    icon: `<div style="width:36px;height:36px;border-radius:9px;background:var(--danger-bg);color:var(--danger);display:grid;place-items:center">${Icon('box',18)}</div>`,
    body: `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${DATA.INVENTORY.filter(p => p.advice === '発注推奨').map(p => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface-2);border-radius:8px;cursor:pointer" onclick="closeModal();openProduct('${p.sku}')">
            <div style="width:36px;height:36px;border-radius:8px;background:var(--surface);border:1px solid var(--border);display:grid;place-items:center;color:var(--text-mute)">${Icon('box',16)}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500">${p.name}</div>
              <div style="font-size:11px;color:var(--text-mute);font-family:monospace">${p.sku}</div>
            </div>
            <div style="color:var(--danger);font-weight:700;font-size:18px">${p.stock}<span style="font-size:11px;color:var(--text-mute);font-weight:400;margin-left:2px">点</span></div>
          </div>
        `).join('')}
      </div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn ai" onclick="closeModal();openApprovalCompose(3)">${Icon('sparkles',13)} AI 発注書ドラフトを確認</button>
    `,
  });
}

/* ===== AI 下書き → 承認モーダル (item 13) ===== */
function openApprovalCompose(ref) {
  const a = (ref && typeof ref === 'object') ? ref : DATA.APPROVALS[ref];
  if (!a) return;
  const isIdx = typeof ref === 'number';
  const suppressNote = a.kind === 'メール一括送付'
    ? `<div style="font-size:11.5px;color:var(--text-mute);margin-top:8px;display:flex;align-items:center;gap:6px">${Icon('pause',11)} 配信頻度上限に達した顧客は自動で除外されます（過剰配信の抑制）</div>` : '';
  openModal({
    title: 'AI 生成内容を確認・承認',
    subtitle: a.content,
    size: 'lg',
    icon: `<div style="width:36px;height:36px;border-radius:9px;background:var(--ai-bg);color:var(--ai);display:grid;place-items:center">${Icon('sparkles',18)}</div>`,
    body: `
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <span class="badge b-ai">${a.kind}</span>
        <span class="badge b-neutral">対象: ${a.target}</span>
        <span class="badge b-success">予測 ${a.impact}</span>
        <span class="badge ${a.risk==='高'?'b-danger':a.risk==='中'?'b-warn':'b-neutral'}">リスク: ${a.risk}</span>
      </div>
      <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:6px">AI 根拠</div>
      <div style="font-size:12.5px;color:var(--text-soft);background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:16px">${a.reason}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600">AI 生成ドラフト（編集可）</span>
        <button class="btn ai sm" onclick="streamText('__approval_draft', window.__lastDraft||'')">${Icon('sparkles',12)} 再生成</button>
      </div>
      <textarea class="input" id="__approval_draft" rows="7" style="width:100%;padding:12px;resize:vertical;line-height:1.7;font-size:13px"></textarea>
      ${suppressNote}
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn danger" onclick="${isIdx ? `resolveApproval(${ref},false);closeModal()` : `toast('却下しました');closeModal()`}">却下</button>
      <button class="btn primary" onclick="${isIdx ? `resolveApproval(${ref},true);closeModal()` : `toast('承認して送信しました');closeModal()`}">${Icon('check',13)} 承認して送信</button>
    `,
  });
  window.__lastDraft = a.draft || '';
  streamText('__approval_draft', window.__lastDraft);   // AIが文面を生成する演出（4b）
}

/* 在庫→発注→ワークフロー導線 (D22): 商品から発注書ドラフトを起票 */
function openPurchaseDraft(sku) {
  const p = (DATA.INVENTORY || []).find(x => x.sku === sku) || { name: '商品', stock: 0 };
  const qty = 20;
  openApprovalCompose({
    kind: '発注書ドラフト',
    content: `${p.name} ${qty}点 を発注`,
    target: 'メーカーA',
    impact: '-',
    risk: p.stock < 5 ? '高' : '中',
    reason: `在庫残 ${p.stock} 点・AI 発注推奨`,
    draft: `発注書（ドラフト）\n品目：${p.name} × ${qty}点\n発注先：メーカーA／希望納期：5/30\n根拠：在庫残 ${p.stock} 点、直近の閲覧増。\n承認後、発注ワークフローに自動登録されます。`,
  });
}

/* ===== Misc handlers ===== */
function switchTaskTab(el, label) {
  el.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  window.taskFilter = label;        // 実際に絞り込む（Y17）
  if (window.renderTasks) renderTasks();
}

function filterStream(value) {
  toast(value === '全エージェント' ? 'フィルター解除' : `${value} のみ表示中`);
}

/* Expose globals */
Object.assign(window, {
  openSettings, openNotifications, openSearchPalette,
  openNewTaskModal, openNewCustomerModal, openNewDealModal,
  openNewCampaignModal, openNewProductModal, openNewUserModal,
  openUserEdit, newConnection, runAnalyticsQuery,
  recalcLeadScore, bulkAIApproach,
  bulkApproveAll, bulkRejectAll, refreshDashboard,
  exportCSV, printOrderLabels, regenerateInsights,
  showInventoryAlert, switchTaskTab, filterStream,
  openApprovalCompose, openPurchaseDraft,
});

/* ===== Hijack the openIntegrationDetail handler used in HTML – route to details.js openIntegration ===== */
window.openIntegrationDetail = function(name) {
  const cfg = {
    'Oracle Database': {req:'12,438',lat:'85ms',err:'0.01%'},
    'BigQuery': {req:'2,184',lat:'1.2s',err:'0%',cost:'¥22,400'},
    'Google Analytics 4': {req:'24,892',lat:'320ms',err:'0.02%'},
    'Anthropic Claude API': {req:'1.2M tok',lat:'2.4s',err:'0.04%',cost:'¥143,000'},
    'LINE Messaging API': {req:'8,432',lat:'140ms',err:'0.08%',cost:'¥28,000'},
    'MCP サーバー': {req:'198',lat:'42ms',err:'0%'},
    'Google レコメンドエンジン': {req:'18,420',lat:'95ms',err:'0%'},
    'SendGrid': {req:'-',lat:'-',err:'-'},
  };
  if (window.openIntegration) {
    openIntegration(name, cfg[name] || {});
  } else {
    toast(`${name} の詳細`);
  }
};

/* ===== Pre-create CMD+K shortcut ===== */
window.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearchPalette();
  }
});
