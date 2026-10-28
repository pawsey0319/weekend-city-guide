(function (W) {
  const { h, S, save, mount, money } = W;
  const DAY = { sat: '周六', sun: '周日' };
  let wk = null;

  function dayCard(d, root) {
    const wx = W.weather.effective(wk, d);
    const items = S.plan[d].map(W.evById).filter(Boolean);
    const cost = items.reduce((a, e) => a + e.price, 0);
    const hours = items.reduce((a, e) => a + e.hours, 0);
    const rainyOutdoor = wx && wx.rain ? items.filter((e) => !e.indoor) : [];
    return h('section', { class: 'card' },
      h('div', { class: 'row' }, h('h2', { class: 'grow', style: 'margin:0' }, DAY[d]),
        wx ? h('span', { class: 'tag' + (wx.rain ? ' acc' : '') }, wx.icon + ' ' + wx.label) : null),
      items.length ? null : h('p', { class: 'empty' }, '还没有安排，去「发现」里加入活动，或点上方“自动安排”。'),
      h('ol', { class: 'stops' }, items.map((e) => h('li', {},
        h('b', {}, e.title), ' ', h('span', { class: 'muted small' }, money(e.price) + ' · ' + e.hours + 'h'), ' ',
        h('button', { class: 'btn sm ghost', 'aria-label': '移除 ' + e.title,
          on: { click: () => { S.plan[d] = S.plan[d].filter((x) => x !== e.id); save(); render(root); } } }, '移除')))),
      items.length ? h('p', { class: 'small muted' }, '预计花费 ¥' + cost + ' · 共 ' + hours + ' 小时') : null,
      rainyOutdoor.map((e) => {
        const alt = W.rec.planB(e, S.prefs, wx);
        return h('div', { class: 'note', style: 'margin-top:8px' },
          '「' + e.title + '」当天降雨概率高。',
          alt ? h('span', {}, ' 备选：', h('b', {}, alt.ev.title), ' ',
            h('button', { class: 'btn sm', on: { click: () => {
              S.plan[d] = S.plan[d].map((x) => (x === e.id ? alt.ev.id : x)); save(); render(root);
            } } }, '换成备选')) : ' 建议改期。');
      }));
  }
  function balance() {
    const sum = (d) => S.plan[d].map(W.evById).filter(Boolean).reduce((a, e) => a + e.energy, 0);
    const a = sum('sat'), b = sum('sun');
    if (!a && !b) return null;
    if (a >= 5 && b >= 5) return h('p', { class: 'note' }, '两天强度都偏高，周日建议换成一项轻松的活动，给自己留出恢复时间。');
    if (a + b <= 2) return h('p', { class: 'ok' }, '这个周末很轻松，如果还有精力，可以加一项户外活动。');
    return h('p', { class: 'ok' }, '两天强度搭配比较均衡。');
  }
  function autoPlan(root) {
    const p = S.prefs;
    const used = new Set();
    ['sat', 'sun'].forEach((d) => {
      const wx = W.weather.effective(wk, d);
      const pool = W.rec.rank(p, wx).filter((r) => r.score >= 50 && !used.has(r.ev.id));
      pool.sort((x, y) => (d === 'sat' ? y.ev.energy - x.ev.energy : x.ev.energy - y.ev.energy) || y.score - x.score);
      const pick = pool.slice(0, 2).map((r) => r.ev.id);
      pick.forEach((i) => used.add(i));
      S.plan[d] = pick;
    });
    save();
    W.toast('已按天气和体力平衡生成');
    render(root);
  }
  function planText() {
    const lines = ['【我的周末计划】'];
    ['sat', 'sun'].forEach((d) => {
      const es = S.plan[d].map(W.evById).filter(Boolean);
      lines.push(DAY[d] + '：' + (es.length ? es.map((e) => e.title + '(' + money(e.price) + ')').join(' → ') : '休息'));
    });
    lines.push('—— 来自「周末城市探索指南」');
    return lines.join('\n');
  }
  function render(root) {
    mount(root,
      h('section', { class: 'hero' }, h('h1', {}, '周末计划'),
        h('p', {}, '把想去的活动排进周六和周日，系统会检查天气和强度是否平衡。')),
      h('div', { class: 'row', style: 'margin-bottom:14px' },
        h('button', { class: 'btn pri', on: { click: () => autoPlan(root) } }, '✨ 自动安排'),
        h('button', { class: 'btn', on: { click: () => W.copy(planText()) } }, '复制成文字发群里'),
        h('button', { class: 'btn ghost', on: { click: () => { S.plan = { sat: [], sun: [] }; save(); render(root); } } }, '清空')),
      balance(),
      h('div', { class: 'grid g2' }, dayCard('sat', root), dayCard('sun', root)));
  }
  W.views = W.views || {};
  W.views.plan = (root) => {
    render(root);
    W.weather.getWeekend(S.prefs.city).then((r) => { wk = r; if (W.route === 'plan') render(root); });
  };
})(window.WCG);
