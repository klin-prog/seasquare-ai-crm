/* =====================================================================
   Today Engine ― デモ日付を「当日」に追従させる
   データは基準日 2026-05-20 で作成されている。実際の今日との差分を
   すべての表示日付にスライドして適用する（相対的な前後関係は維持）。
   ===================================================================== */
(function () {
  const ANCHOR = new Date('2026-05-20T00:00:00');
  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const DAY = 86400000;
  const DELTA_DAYS = Math.round((today0 - ANCHOR) / DAY);

  const pad = n => String(n).padStart(2, '0');
  const fromOffset = off => new Date(today0.getTime() + off * DAY);

  window.TODAY = {
    date: today0,
    deltaDays: DELTA_DAYS,
    short(off = 0) { const d = fromOffset(off); return (d.getMonth() + 1) + '/' + d.getDate(); },
    ymd(off = 0) { const d = fromOffset(off); return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()); },
    iso(off = 0) { const d = fromOffset(off); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    monthNum() { return today0.getMonth() + 1; },
    year() { return today0.getFullYear(); },
    dayNum() { return today0.getDate(); },
    weekdayJa() { return ['日', '月', '火', '水', '木', '金', '土'][today0.getDay()] + '曜日'; },
    greeting() {
      const h = now.getHours();
      if (h >= 5 && h < 11) return 'おはようございます';
      if (h >= 11 && h < 18) return 'こんにちは';
      return 'こんばんは';
    },
    /* 直近6ヶ月(実績) + 先6ヶ月(予測) のローリング月ラベル */
    monthLabels12() {
      const out = [];
      for (let i = -5; i <= 6; i++) {
        out.push(((today0.getMonth() + i + 24) % 12) + 1 + '月');
      }
      return out;
    },
  };

  /* --- 日付文字列のシフト --- */
  function shiftYmdParts(y, m, d) {
    const dt = new Date(y, m - 1, d);
    return new Date(dt.getTime() + DELTA_DAYS * DAY);
  }
  function shiftString(s) {
    // YYYY/MM/DD・YYYY-MM-DD（文字列中のどこでも）
    s = s.replace(/\b(20\d{2})([\/\-])(\d{1,2})\2(\d{1,2})\b/g, (all, y, sep, m, d) => {
      const nd = shiftYmdParts(+y, +m, +d);
      return nd.getFullYear() + sep + pad(nd.getMonth() + 1) + sep + pad(nd.getDate());
    });
    // M/D または MM/DD HH:MM（フィールド全体が日付のもののみ。分数や比率は対象外）
    const m = s.match(/^(\d{1,2})\/(\d{1,2})( \d{1,2}:\d{2})?$/);
    if (m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= 31) {
      // 年は基準年で解釈し、基準日から300日以上未来なら前年扱い（12月→1月またぎ対策）
      let raw = new Date(ANCHOR.getFullYear(), +m[1] - 1, +m[2]);
      if (raw - ANCHOR > 300 * DAY) raw = new Date(ANCHOR.getFullYear() - 1, +m[1] - 1, +m[2]);
      const base = new Date(raw.getTime() + DELTA_DAYS * DAY);
      const padded = m[1].length === 2;
      const ds = padded ? pad(base.getMonth() + 1) + '/' + pad(base.getDate())
                        : (base.getMonth() + 1) + '/' + base.getDate();
      return ds + (m[3] || '');
    }
    // 「5月クォータ」等、基準月への言及を当月に置換
    const curM = today0.getMonth() + 1;
    if (curM !== 5) s = s.replace(/(^|\D)5月/g, '$1' + curM + '月');
    return s;
  }
  function walk(obj) {
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => { if (typeof v === 'string') obj[i] = shiftString(v); else if (v && typeof v === 'object') walk(v); });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(k => {
        const v = obj[k];
        if (typeof v === 'string') obj[k] = shiftString(v);
        else if (v && typeof v === 'object') walk(v);
      });
    }
  }

  if (window.DATA) walk(window.DATA);
  if (window.PURCHASES) walk(window.PURCHASES);

  /* 受注番号 ORD-YYMMDDss を、シフト後の日時に合わせて再生成 */
  if (window.DATA && Array.isArray(DATA.ORDERS)) {
    DATA.ORDERS.forEach(o => {
      const m = String(o.dt).match(/^(\d{2})\/(\d{2})/);
      const seq = String(o.no).slice(-2);
      if (m && /^ORD-\d{8}$/.test(o.no)) {
        // dt はシフト済み。年は当日基準（未来に見える月は前年扱いにしない：受注は直近想定）
        let y = today0.getFullYear();
        const cand = new Date(y, +m[1] - 1, +m[2]);
        if (cand - today0 > 30 * DAY) y -= 1;
        o.no = 'ORD-' + String(y).slice(-2) + m[1] + m[2] + seq;
      }
    });
  }

  /* スコアリング基準日を当日に */
  if (window.SCORING) SCORING.asOf = TODAY.iso(0);

  /* --- 静的DOMの当日化（スクリプトは body 末尾で実行される） --- */
  const greetEl = document.getElementById('dash-greet');
  if (greetEl) greetEl.textContent = TODAY.greeting() + '、梶原さん';
  const dateEl = document.getElementById('dash-date');
  if (dateEl) dateEl.textContent = TODAY.ymd(0) + ' ' + TODAY.weekdayJa() + ' ・ 今日のダッシュボード';
  const asofEl = document.getElementById('leads-asof');
  if (asofEl) asofEl.textContent = TODAY.ymd(0);
  const logDate = document.getElementById('log-date');
  if (logDate) logDate.value = TODAY.iso(0);
  document.querySelectorAll('.js-rel[data-off]').forEach(el => {
    el.textContent = TODAY.short(parseInt(el.dataset.off, 10) || 0);
  });
})();
