// Mock data for AI×CRM console

/* ===== 行動スコアモデル (items 7, 8) =====
   家具ECは「高単価・長検討・空間で選ぶ」。RFM の頻度偏重ではなく、
   購入意欲を表す“空間検討”行動（AR・マイルーム）を高ウェイトに置く。
   スコア = Σ(行動ウェイト)（上限99）。リード/顧客詳細に内訳を表示する。 */
window.ACTION_TYPES = {
  ar_view:    { label: 'AR で部屋に試し置き',      w: 30, ic: 'box' },
  myroom:     { label: 'マイルーム（コーデ保存）', w: 26, ic: 'home' },
  cart_hold:  { label: 'カート保留',              w: 20, ic: 'deal' },
  pdp_repeat: { label: '商品詳細を複数回閲覧',     w: 14, ic: 'eye' },
  long_stay:  { label: '長時間滞在（15分+）',      w: 12, ic: 'clock' },
  favorite:   { label: 'お気に入り追加',          w: 12, ic: 'flame' },
  catalog_dl: { label: '実例カタログDL',          w: 10, ic: 'download' },
  price_cmp:  { label: '価格帯比較ページ',         w:  9, ic: 'chart' },
  revisit:    { label: '再訪問',                  w:  7, ic: 'refresh' },
  email_open: { label: 'メール開封',              w:  5, ic: 'mail' },
};

/* 育成シナリオ — 家具は週〜月単位で検討。即時CVではなく日数ベースで導線化 (item 10) */
window.NURTURE = [
  { day: 'Day 0',  label: 'AR体験リンクを送付（LINE）', note: '検討初期。空間イメージを提示し関心を維持' },
  { day: 'Day 3',  label: '閲覧状況で分岐：コーデ提案 / 実例カタログ', note: 'AR閲覧者には3Dコーデ、未閲覧者には事例を送付' },
  { day: 'Day 7',  label: '期間限定クーポン + 設置事例', note: '比較検討期。背中を押すオファー' },
  { day: 'Day 30', label: '未CVなら来店予約 / オンライン相談を提案', note: '長期検討者をオフライン接客へ' },
];

window.DATA = {
  // fseg = 家具向けセグメント（新規 / 高単価検討中 / リピート育成中 / VIP / 離脱リスク / 離脱(1年+)）
  // dlv  = 配信抑制（last: 最終配信, week: 今週配信回数, cap: 週上限）。week>=cap で「送信抑制中」
  CUSTOMERS: [
    {id:'CST-001',name:'佐藤 美咲',seg:'リピート',fseg:'リピート育成中',ltv:480000,last:'2026/04/12',count:6,ch:'EC',score:90,
      acts:['ar_view','myroom','cart_hold','pdp_repeat'], dlv:{last:'2026/06/22',week:2,cap:2}},
    {id:'CST-002',name:'田中 健一',seg:'新規',fseg:'高単価検討中',ltv:180000,last:'2026/05/15',count:1,ch:'広告',score:75,
      acts:['ar_view','pdp_repeat','catalog_dl','long_stay','price_cmp'], dlv:{last:'2026/06/21',week:1,cap:2}},
    {id:'CST-003',name:'山本 葵',  seg:'VIP',fseg:'VIP',ltv:820000,last:'2026/05/08',count:11,ch:'LINE',score:94,
      acts:['ar_view','myroom','favorite','long_stay','pdp_repeat'], dlv:{last:'2026/06/22',week:2,cap:2}},
    {id:'CST-004',name:'鈴木 大輔',seg:'新規',fseg:'新規',ltv:120000,last:'2026/05/18',count:0,ch:'EC',score:55,
      acts:['price_cmp','pdp_repeat','long_stay','cart_hold'], dlv:{last:'2026/06/19',week:1,cap:2}},
    {id:'CST-005',name:'高橋 真理',seg:'休眠',fseg:'離脱リスク',ltv:240000,last:'2025/11/05',count:3,ch:'LINE',score:34,
      acts:['email_open','revisit','catalog_dl','favorite'], dlv:{last:'2026/06/10',week:0,cap:2}},
    {id:'CST-006',name:'伊藤 拓海',seg:'新規',fseg:'新規',ltv:80000, last:'2026/05/19',count:0,ch:'広告',score:40,
      acts:['pdp_repeat','price_cmp','favorite','email_open'], dlv:{last:'2026/06/18',week:0,cap:2}},
    {id:'CST-007',name:'渡辺 さくら',seg:'リピート',fseg:'リピート育成中',ltv:340000,last:'2026/03/20',count:4,ch:'EC',score:36,
      acts:['pdp_repeat','catalog_dl','revisit','email_open'], dlv:{last:'2026/06/15',week:1,cap:2}},
    {id:'CST-008',name:'中村 健太郎',seg:'VIP',fseg:'VIP',ltv:1240000,last:'2026/05/10',count:18,ch:'店舗',score:90,
      acts:['ar_view','myroom','long_stay','favorite','catalog_dl'], dlv:{last:'2026/06/20',week:1,cap:3}},
    {id:'CST-009',name:'小林 由美',seg:'リピート',fseg:'リピート育成中',ltv:280000,last:'2026/04/28',count:3,ch:'EC',score:45,
      acts:['pdp_repeat','favorite','long_stay','revisit'], dlv:{last:'2026/06/12',week:0,cap:2}},
    {id:'CST-010',name:'加藤 翔',  seg:'休眠',fseg:'離脱(1年+)',ltv:90000, last:'2025/05/20',count:1,ch:'EC',score:12,
      acts:['email_open','revisit'], dlv:{last:'2026/02/01',week:0,cap:2}},
    {id:'CST-011',name:'吉田 ありさ',seg:'新規',fseg:'新規',ltv:60000, last:'2026/05/19',count:0,ch:'LINE',score:28,
      acts:['pdp_repeat','price_cmp','email_open'], dlv:{last:'2026/06/17',week:1,cap:2}},
    {id:'CST-012',name:'山口 凛',  seg:'リピート',fseg:'高単価検討中',ltv:520000,last:'2026/05/12',count:7,ch:'EC',score:68,
      acts:['ar_view','pdp_repeat','favorite','long_stay'], dlv:{last:'2026/06/13',week:0,cap:2}},
  ],

  // score は acts（行動）から導出（item 7）。acts に ar_view/myroom を持つ客が高スコア（item 8）
  LEADS: [
    {id:1,name:'佐藤 美咲',score:90,seg:'リピート',last:'ソファ詳細を3回閲覧 / カート保留',action:'AR体験リンクをLINE送付',revenue:189000,ch:'LINE',
      acts:['ar_view','myroom','cart_hold','pdp_repeat']},
    {id:2,name:'田中 健一',score:75,seg:'新規',    last:'ダイニング3点セット閲覧',          action:'実例カタログ + 10%クーポン',revenue:178000,ch:'メール',
      acts:['ar_view','pdp_repeat','catalog_dl','long_stay','price_cmp']},
    {id:3,name:'中村 健太郎',score:90,seg:'VIP',  last:'寝室家具ページ滞在 18分',           action:'専任担当による電話フォロー',revenue:480000,ch:'電話',
      acts:['ar_view','myroom','long_stay','favorite','catalog_dl']},
    {id:4,name:'山本 葵',  score:94,seg:'VIP',    last:'お気に入り5件 / 滞在23分',           action:'コーディネーター提案',revenue:260000,ch:'メール',
      acts:['ar_view','myroom','favorite','long_stay','pdp_repeat']},
    {id:5,name:'鈴木 大輔',score:55,seg:'新規',    last:'価格帯比較ページ滞在',              action:'価格相談チャット起動',revenue:120000,ch:'チャット',
      acts:['price_cmp','pdp_repeat','long_stay','cart_hold']},
    {id:6,name:'高橋 真理',score:22,seg:'休眠',    last:'前回購入から180日経過',              action:'リピート提案(ラグ・カーテン)',revenue:48000,ch:'メール',
      acts:['email_open','revisit','catalog_dl']},
    {id:7,name:'伊藤 拓海',score:40,seg:'新規',    last:'広告経由訪問・3商品閲覧',            action:'初回限定クーポン送付',revenue:36000,ch:'メール',
      acts:['pdp_repeat','price_cmp','favorite','email_open']},
  ],

  // status = 未対応 / 対応中 / 完了（受信箱タブで絞り込み・Y17）
  TASKS: [
    {id:1,title:'佐藤さまへAR体験リンクをLINE送付',customer:'佐藤 美咲',due:'今日 18:00',source:'AI',reason:'スコア急上昇',priority:'高',status:'未対応'},
    {id:2,title:'ナチュラルウッドダイニング 在庫補充発注',customer:'-',due:'今日中',source:'AI',reason:'在庫AI予測',priority:'高',status:'対応中'},
    {id:3,title:'中村さま向けカスタム提案書を作成',customer:'中村 健太郎',due:'明日 12:00',source:'AI',reason:'VIP高額商談',priority:'高',status:'未対応'},
    {id:4,title:'5月の売れ筋トップ10レポート生成',customer:'-',due:'明日 09:00',source:'AI',reason:'定期実行',priority:'中',status:'完了'},
    {id:5,title:'180日未購入の20名にクーポン配信',customer:'-',due:'5/21',source:'AI',reason:'チャーン予測',priority:'中',status:'未対応'},
    {id:6,title:'新商品「デスクライト」企画ミーティング招集',customer:'-',due:'5/22',source:'AI',reason:'検索ログ分析',priority:'中',status:'未対応'},
    {id:7,title:'田中さまへ実例カタログ送付',customer:'田中 健一',due:'今日 17:00',source:'AI',reason:'スコア80+',priority:'中',status:'対応中'},
    {id:8,title:'山本さまフォロー電話',customer:'山本 葵',due:'明日 14:00',source:'手動',reason:'-',priority:'低',status:'未対応'},
    {id:9,title:'4月配送遅延の謝罪メール送付',customer:'-',due:'今日中',source:'手動',reason:'-',priority:'高',status:'完了'},
    {id:10,title:'AR利用ガイド動画 撮影手配',customer:'-',due:'5/25',source:'手動',reason:'-',priority:'低',status:'未対応'},
    {id:11,title:'店頭スタッフ向けAI提案アラート確認',customer:'-',due:'毎日',source:'AI',reason:'業務改善',priority:'低',status:'未対応'},
    {id:12,title:'5月クォータ進捗の経営報告',customer:'-',due:'5/24',source:'手動',reason:'-',priority:'高',status:'未対応'},
  ],

  ORDERS: [
    {no:'ORD-26052001',dt:'05/20 09:42',customer:'佐藤 美咲',item:'モダンコーナーソファ',amt:189000,pay:'カード',status:'新規',ai:true},
    {no:'ORD-26052002',dt:'05/20 09:18',customer:'山本 葵',item:'ダイニング3点',amt:324000,pay:'カード',status:'出荷準備中',ai:true},
    {no:'ORD-26052003',dt:'05/20 08:55',customer:'中村 健太郎',item:'寝室セット',amt:480000,pay:'銀行振込',status:'出荷準備中',ai:true},
    {no:'ORD-26052004',dt:'05/20 02:14',customer:'伊藤 拓海',item:'フロアランプ',amt:36800,pay:'カード',status:'出荷済',ai:true},
    {no:'ORD-26051912',dt:'05/19 22:30',customer:'田中 健一',item:'ラグ + サイドテーブル',amt:39300,pay:'代引',status:'出荷済',ai:false},
    {no:'ORD-26051911',dt:'05/19 18:42',customer:'渡辺 さくら',item:'カーテン x 2',amt:25600,pay:'カード',status:'配送完了',ai:true},
    {no:'ORD-26051910',dt:'05/19 17:08',customer:'小林 由美',item:'ダイニングチェア x 4',amt:72000,pay:'カード',status:'配送完了',ai:false},
    {no:'ORD-26051909',dt:'05/19 15:30',customer:'山口 凛',item:'ペンダントライト',amt:22000,pay:'カード',status:'キャンセル',ai:true},
  ],

  INVENTORY: [
    {sku:'TABLE-001',name:'ナチュラルウッド ダイニングテーブル',cat:'テーブル',price:128000,stock:3,views:842,cvr:'12.4%',ar:'3D+AR',advice:'発注推奨'},
    {sku:'SOFA-001', name:'モダンコーナーソファ ベージュ',     cat:'ソファ',  price:189000,stock:8,views:1240,cvr:'8.2%',ar:'3D+AR',advice:'監視'},
    {sku:'LAMP-001', name:'デザインフロアランプ',              cat:'照明',    price:36800, stock:25,views:580,cvr:'5.4%',ar:'3D',   advice:'-'},
    {sku:'RUG-001',  name:'オーガニックコットン ラグ',         cat:'ラグ',    price:24500, stock:40,views:312,cvr:'3.1%',ar:'AR',   advice:'-'},
    {sku:'CHAIR-001',name:'北欧ダイニングチェア',              cat:'チェア',  price:18000, stock:50,views:486,cvr:'7.8%',ar:'3D+AR',advice:'-'},
    {sku:'TABLE-002',name:'スカンジ サイドテーブル',           cat:'テーブル',price:14800, stock:2, views:128,cvr:'4.2%',ar:'3D',   advice:'発注推奨'},
    {sku:'CURTAIN-001',name:'リネンカーテン アイボリー',       cat:'カーテン',price:12800, stock:80,views:218,cvr:'2.8%',ar:'AR',   advice:'-'},
    {sku:'LAMP-002', name:'ペンダントライト ガラス',           cat:'照明',    price:22000, stock:18,views:344,cvr:'6.1%',ar:'3D+AR',advice:'監視'},
  ],

  CAMPAIGNS: [
    {name:'母の日リピート訴求',ch:'LINE',target:'2,318名',open:'72.4%',ctr:'18.2%',cv:'8',rev:'¥640,000',status:'配信中',by:'AI'},
    {name:'ダイニング3点セット紹介',ch:'メール',target:'1,442名',open:'48.1%',ctr:'12.4%',cv:'12',rev:'¥456,000',status:'配信中',by:'AI'},
    {name:'休眠顧客リエンゲージ',ch:'メール',target:'480名',open:'34.2%',ctr:'8.8%',cv:'5',rev:'¥118,000',status:'配信中',by:'AI'},
    {name:'夏のラグ特集',ch:'LINE',target:'2,180名',open:'-',ctr:'-',cv:'-',rev:'-',status:'予約',by:CONFIG.user.name},
    {name:'新規会員10%OFF',ch:'メール',target:'新規',open:'-',ctr:'-',cv:'-',rev:'-',status:'予約',by:'AI'},
    {name:'秋冬カーテン早期予約',ch:'LINE',target:'検討中',open:'-',ctr:'-',cv:'-',rev:'-',status:'下書き',by:CONFIG.user.name},
  ],

  INSIGHTS: [
    {icon:'target',title:'高スコア見込客24名へLINE一括アプローチ',detail:'過去30日でソファ・ラグの両方を閲覧した顧客群。AIがパーソナライズメッセージを生成済み。送信目安: 本日18時。',impact:'予測CV: 8件 / +¥640,000',cta:'承認・実行',urgent:true},
    {icon:'box',title:'在庫切迫: ナチュラルウッドダイニング 残3点',detail:'直近7日で閲覧+88%。3D表示完了率も高い。再入荷予約導線を有効化することを推奨。',impact:'機会損失予測 -¥240,000',cta:'設定する'},
    {icon:'lightbulb',title:'商品ラインナップ提案: 在宅ワーク向けデスクライト',detail:'GA4の検索ログから「デスクライト」検索が423件あったが該当商品なし。粗利率予測28%。',impact:'予測月間貢献 +¥320,000',cta:'詳細を見る'},
    {icon:'mail',title:'休眠顧客リエンゲージキャンペーン',detail:'180日以上購入なしの48名のうち、過去にラグ・カーテンを購入した32名にリピート提案。',impact:'予測CV: 6件 / +¥180,000',cta:'承認・実行'},
  ],

  // draft = AI が生成した下書き本文（承認モーダルで編集可能・item 13）
  APPROVALS: [
    {kind:'メール一括送付',content:'休眠顧客32名へリピート提案',target:'32名',impact:'+¥180,000',reason:'180日以上未購入 & 過去ラグ・カーテン購入歴',time:'09:32',risk:'低',
      draft:'ご無沙汰しております。以前お選びいただいたラグ・カーテンと相性の良い新作が入荷しました。\nAR で“今の”お部屋に合わせたイメージをその場でご確認いただけます。\n▶ AR で見てみる'},
    {kind:'商品ラインナップ',content:'在宅ワーク向けデスクライト 3SKU 企画',target:'-',impact:'+¥320,000/月',reason:'GA4検索ログ 423件',time:'08:14',risk:'中',
      draft:'【企画ドラフト】在宅ワーク向け「デスクライト」カテゴリを新設。\n初期3SKU（調光LED / クランプ式 / 充電式）。想定粗利率28%、月間貢献 +¥320,000。\n仕入先候補2社に見積依頼済み。'},
    {kind:'値引きクーポン',content:'伊藤 拓海さまへ初回10%OFF',target:'伊藤 拓海',impact:'+¥36,000',reason:'広告経由・スコア急上昇',time:'07:48',risk:'低',
      draft:'伊藤さま、はじめまして。\n気になる商品はございましたか？ 初めてのお買い物に使える 10%OFF クーポンをお届けします。\nこの機会にぜひお部屋づくりをお楽しみください。'},
    {kind:'発注書ドラフト',content:'ナチュラルウッドダイニング 20点',target:'メーカーA',impact:'-',reason:'在庫切迫AI予測',time:'06:00',risk:'高',
      draft:'発注書（ドラフト）\n品目：ナチュラルウッド ダイニングテーブル × 20点\n発注先：メーカーA／希望納期：5/30\n根拠：直近7日で閲覧+88%、在庫残3点。'},
  ],

  AGENT_LOG: [
    {time:'09:42:18',agent:'接客AI',tool:'search_products',input:'category=ソファ price<200000',result:'4件',ms:340,tok:485,status:'success'},
    {time:'09:41:55',agent:'接客AI',tool:'get_customer',input:'customer_id=1',result:'佐藤 美咲',ms:120,tok:312,status:'success'},
    {time:'09:38:12',agent:'営業AI',tool:'create_deal',input:'customer_id=3, amount=480000',result:'DEAL-1042 作成',ms:840,tok:1240,status:'success'},
    {time:'09:35:00',agent:'在庫AI',tool:'bigquery_sql',input:'SELECT inventory velocity...',result:'18 rows',ms:2340,tok:680,status:'success'},
    {time:'09:33:42',agent:'接客AI',tool:'search_products',input:'query=10畳 ナチュラル',result:'3件',ms:280,tok:412,status:'success'},
    {time:'09:30:18',agent:'営業AI',tool:'create_task',input:'佐藤さまへAR体験リンクLINE送付',result:'TASK-2331 作成',ms:140,tok:380,status:'success'},
    {time:'09:28:55',agent:'営業AI',tool:'send_line',input:'高スコア客24名一括',result:'承認待ち',ms:88,tok:240,status:'pending'},
    {time:'09:25:10',agent:'接客AI',tool:'create_deal',input:'amount=12000',result:'金額閾値未満で中断',ms:42,tok:180,status:'error'},
    {time:'09:21:08',agent:'分析AI',tool:'bigquery_sql',input:'チャーン予測クエリ',result:'48 rows',ms:5410,tok:920,status:'success'},
    {time:'09:18:30',agent:'接客AI',tool:'search_products',input:'category=照明',result:'8件',ms:310,tok:445,status:'success'},
  ],

  DEALS_BOARD: [
    {key:'new',title:'新規',count:2,sum:'¥372K',color:'',items:[
      {c:'佐藤 美咲',t:'リビング3点セット',a:324000,src:'AI'},
      {c:'伊藤 拓海',t:'新規お試しセット',a:48000,src:'AI'},
    ]},
    {key:'qualified',title:'検討中',count:2,sum:'¥658K',color:'warn',items:[
      {c:'田中 健一',t:'ダイニング刷新',a:178000,src:'AI'},
      {c:'山本 葵',t:'寝室フルリノベ',a:480000,src:'AI'},
    ]},
    {key:'proposal',title:'提案中',count:1,sum:'¥230K',color:'info',items:[
      {c:'鈴木 大輔',t:'ホームオフィス一式',a:230000,src:'手動'},
    ]},
    {key:'won',title:'受注',count:2,sum:'¥301K',color:'success',items:[
      {c:'中村 健太郎',t:'ソファ + ラグ',a:213000,src:'AI'},
      {c:'山口 凛',t:'照明セット',a:88000,src:'AI'},
    ]},
  ],

  // ワークフロー = トリガー駆動の自動シナリオ（キャンペーンの一括配信とは別管理・item 14）
  // node.type: trigger / send / wait / branch / goal（WF図に描画・item 12a）
  WORKFLOWS: [
    {id:'wf-hot', name:'高スコア見込客フォロー', trigger:'AIスコア ≥ 85 到達', status:'稼働中', enrolled:128, cvr:'12.4%', nodes:[
      {type:'trigger', label:'AIスコア 85 到達'},
      {type:'send',    label:'Day0: AR体験リンクを送付（LINE）'},
      {type:'wait',    label:'3日待機'},
      {type:'branch',  label:'AR を閲覧した？'},
      {type:'send',    label:'Yes → 3Dコーデ提案 / No → 実例カタログ'},
      {type:'wait',    label:'Day7 まで待機'},
      {type:'send',    label:'Day7: 期間限定クーポン + 設置事例'},
      {type:'goal',    label:'CV（受注）'},
    ]},
    {id:'wf-dormant', name:'休眠リアクティベーション', trigger:'最終購入から 365 日経過', status:'稼働中', enrolled:480, cvr:'4.2%', nodes:[
      {type:'trigger', label:'最終購入 365 日経過'},
      {type:'send',    label:'Day0: 「お久しぶり」クーポン（メール）'},
      {type:'wait',    label:'7日待機'},
      {type:'branch',  label:'開封した？'},
      {type:'send',    label:'未開封 → LINE で再アプローチ'},
      {type:'goal',    label:'再購入 / 配信停止'},
    ]},
    {id:'wf-cart', name:'カート放棄リカバリ', trigger:'カート保留 24 時間', status:'一時停止', enrolled:64, cvr:'18.6%', nodes:[
      {type:'trigger', label:'カート保留 24h'},
      {type:'send',    label:'リマインド（LINE）'},
      {type:'wait',    label:'48時間待機'},
      {type:'branch',  label:'購入した？'},
      {type:'send',    label:'未購入 → 在庫僅少アラート + 送料無料'},
      {type:'goal',    label:'CV（受注）'},
    ]},
  ],

  // 効果指標の時系列（CV率 / 開封率 / 配信解除率・item 12b）
  FUNNEL: {
    weeks: ['W1','W2','W3','W4','W5','W6','W7','W8'],
    cvr:   [3.2, 3.6, 4.1, 4.0, 4.6, 5.2, 5.0, 5.8],
    open:  [38, 41, 44, 43, 47, 49, 48, 52],
    unsub: [0.9, 0.8, 1.1, 0.7, 0.6, 0.8, 0.5, 0.6],
  },
};
