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
      <button class="btn" onclick="confirmDialog({title:'ログアウト',body:'ログアウトしますか？',kind:'danger',confirmText:'ログアウト',onConfirm:()=>toast('ログアウトしました')})">ログアウト</button>
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
function runAnalyticsQuery() {
  const inp = document.querySelector('#view-analytics input.input');
  const q = (inp && inp.value.trim()) || '今週ソファカテゴリで一番閲覧された商品 TOP 3';
  openModal({
    title: 'AI 分析結果',
    subtitle: q,
    size: 'lg',
    icon: `<div style="width:36px;height:36px;border-radius:9px;background:var(--ai-bg);color:var(--ai);display:grid;place-items:center">${Icon('sparkles',18)}</div>`,
    body: `
      <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:8px">生成された SQL</div>
      <div style="background:#0f1018;color:#e8e9f1;border-radius:8px;padding:14px;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.7;margin-bottom:18px">
        <span style="color:#a594ff">SELECT</span> product_name, <span style="color:#06d4c4">SUM</span>(views) <span style="color:#a594ff">AS</span> total<br>
        <span style="color:#a594ff">FROM</span> access_logs<br>
        <span style="color:#a594ff">WHERE</span> category = 'ソファ'<br>
        &nbsp;&nbsp;<span style="color:#a594ff">AND</span> date &gt;= '2026-05-14'<br>
        <span style="color:#a594ff">GROUP BY</span> product_name<br>
        <span style="color:#a594ff">ORDER BY</span> total <span style="color:#a594ff">DESC</span> <span style="color:#a594ff">LIMIT</span> 3;
      </div>
      <div style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:8px">結果</div>
      <table class="tbl" style="border:1px solid var(--border);border-radius:8px;overflow:hidden">
        <thead><tr><th>商品名</th><th style="text-align:right">閲覧数</th><th style="text-align:right">CVR</th></tr></thead>
        <tbody>
          <tr><td>モダンコーナーソファ ベージュ</td><td style="text-align:right;font-weight:600">1,240</td><td style="text-align:right">8.2%</td></tr>
          <tr><td>北欧 2 人掛けソファ</td><td style="text-align:right;font-weight:600">842</td><td style="text-align:right">6.4%</td></tr>
          <tr><td>リクライニングソファ</td><td style="text-align:right;font-weight:600">612</td><td style="text-align:right">5.8%</td></tr>
        </tbody>
      </table>
      <div style="margin-top:14px;font-size:11.5px;color:var(--text-mute)">実行時間: 1.4 秒 ・ スキャン: 24,182 行 ・ コスト: ¥4.2</div>
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn" onclick="toast('CSV をダウンロード中')">${Icon('download',13)} CSV</button>
      <button class="btn primary" onclick="toast('ダッシュボードに追加');closeModal()">ダッシュボードに追加</button>
    `,
  });
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
  confirmDialog({
    title: 'すべての提案を承認',
    body: '4 件の AI 提案をまとめて承認・実行します。',
    confirmText: 'すべて承認',
    onConfirm: () => toast('4 件を承認・実行しました'),
  });
}

function bulkRejectAll() {
  confirmDialog({
    title: 'すべての提案を却下',
    body: '4 件の AI 提案をすべて却下します。',
    kind: 'danger',
    confirmText: 'すべて却下',
    onConfirm: () => toast('4 件を却下しました'),
  });
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
            <div style="width:36px;height:36px;border-radius:8px;background:#fff;border:1px solid var(--border);display:grid;place-items:center;color:var(--text-mute)">${Icon('box',16)}</div>
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
      <button class="btn ai" onclick="toast('AI が発注書を一括生成中');closeModal()">${Icon('sparkles',13)} AI 一括発注書生成</button>
    `,
  });
}

/* ===== AI 下書き → 承認モーダル (item 13) ===== */
function openApprovalCompose(idx) {
  const a = DATA.APPROVALS[idx];
  if (!a) return;
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
      <div style="font-size:12.5px;color:var(--text-soft);background:#fafbfd;border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:16px">${a.reason}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:11px;color:var(--text-mute);letter-spacing:.06em;text-transform:uppercase;font-weight:600">AI 生成ドラフト（編集可）</span>
        <button class="btn ai sm" onclick="toast('AI が文面を再生成中 ...')">${Icon('sparkles',12)} 再生成</button>
      </div>
      <textarea class="input" id="__approval_draft" rows="7" style="width:100%;padding:12px;resize:vertical;line-height:1.7;font-size:13px">${a.draft || ''}</textarea>
      ${suppressNote}
    `,
    footer: `
      <button class="btn ghost" onclick="closeModal()">閉じる</button>
      <button class="btn danger" onclick="confirmDialog({title:'AI 提案を却下',body:'この提案を却下します。',kind:'danger',confirmText:'却下',onConfirm:()=>{toast('却下しました');closeModal()}})">却下</button>
      <button class="btn primary" onclick="toast('承認して送信しました');closeModal()">${Icon('check',13)} 承認して送信</button>
    `,
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
  openApprovalCompose,
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
