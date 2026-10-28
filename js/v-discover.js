(function (W) {
  const { h, S, save, mount } = W;
  const DAY = { sat: '周六', sun: '周日' };
  let day = 'sat', wk = null, seq = 0;

  function chipRow(items, isOn, onTap) {
    return h('div', { class: 'row' }, items.map(([k, label]) =>
      h('button', { class: 'chip' + (isOn(k) ? ' on' : ''), 'aria-pressed': String(isOn(k)),
        on: { click: () => onTap(k) } }, label)));
  }
  function wxCard(d) {
    const w = W.weather.effective(wk, d);
    if (!w) return h('div', { class: 'wx' }, h('span', { class: 'ic' }, '🌤️'),
      h('div', {}, h('b', {}, DAY[d] + ' · 暂无预报'), h('span', { class: 'small' }, '无法获取天气，可在右侧手动选择')));
    const sub = w.manual ? '手动设定' : w.tmin + '~' + w.tmax + '℃ · 降雨概率 ' + w.pop + '%';
    return h('div', { class: 'wx' + (w.rain ? ' rain' : '') }, h('span', { class: 'ic' }, w.icon),
      h('div', {}, h('b', {}, DAY[d] + (w.date ? ' ' + w.date.slice(5) : '') + ' · ' + w.label), h('span', { class: 'small' }, sub)));
  }
  function prefsPanel(rerender) {
    const p = S.prefs;
    const set = (k, v) => { p[k] = v; save(); rerender(); };
    const cityOpts = Object.entries(W.CITIES).map(([k, c]) => h('option', { value: k, selected: k === p.city }, c.name));
    return h('section', { class: 'card flat', 'aria-label': '偏好设置' },
      h('div', { class: 'row' },
        h('div', { class: 'grow' }, h('label', { class: 'f', for: 'city', style: 'margin-top:0' }, '城市'),
          h('select', { id: 'city', value: p.city, on: { change: (e) => { set('city', e.target.value); seq++; load(); } } }, cityOpts)),
        h('div', { class: 'grow' }, h('label', { class: 'f', style: 'margin-top:0' }, '同行人数'),
          h('div', { class: 'seg' }, [1, 2, 3, 4, 6].map((n) =>
            h('button', { class: p.party === n ? 'on' : '', on: { click: () => set('party', n) } }, n === 6 ? '5+' : String(n)))))),
      h('label', { class: 'f' }, '想玩的类型（可多选，不选则全部）'),
      chipRow(Object.entries(W.CATS).map(([k, c]) => [k, c.icon + ' ' + c.name]), (k) => p.cats.includes(k),
        (k) => { p.cats = p.cats.includes(k) ? p.cats.filter((x) => x !== k) : p.cats.concat(k); save(); rerender(); }),
      h('label', { class: 'f', for: 'bud' }, '人均预算：' + (p.budget === 0 ? '0 元（只看免费）' : '¥' + p.budget)),
      h('input', { id: 'bud', type: 'range', min: 0, max: 300, step: 10, value: p.budget,
        on: { change: (e) => set('budget', +e.target.value) } }),
      h('div', { class: 'row' },
        h('div', {}, h('label', { class: 'f' }, '今天的体力'),
          h('div', { class: 'seg' }, [1, 2, 3].map((n) =>
            h('button', { class: p.energy === n ? 'on' : '', on: { click: () => set('energy', n) } }, W.ENERGY[n])))),
        h('div', {}, h('label', { class: 'f' }, '社交压力'),
          h('button', { class: 'chip' + (p.quiet ? ' on' : ''), 'aria-pressed': String(p.quiet),
            on: { click: () => set('quiet', !p.quiet) } }, '我想低社交压力'))),
      h('label', { class: 'f' }, '天气（自动读取预报，也可手动覆盖）'),
      chipRow([['auto', '自动'], ['sunny', '☀️ 晴'], ['rain', '🌧️ 雨'], ['cold', '🥶 冷'], ['hot', '🥵 热']],
        (k) => p.wx === k, (k) => set('wx', k)));
  }
  function render(root) {
    const rerender = () => render(root);
    const p = S.prefs;
    const wx = W.weather.effective(wk, day);
    const ranked = W.rec.rank(p, wx);
    mount(root,
      h('section', { class: 'hero' }, h('h1', {}, '这个周末，去哪玩？'),
        h('p', {}, '告诉我你的偏好、预算和人数，我结合当天天气帮你挑，纠结时还能抽个盲盒。')),
      h('div', { class: 'row', style: 'margin-bottom:14px' }, wxCard('sat'), wxCard('sun')),
      !wk || wk.live ? null : h('p', { class: 'note' }, '天气预报暂时获取失败，已使用手动设置。'),
      prefsPanel(rerender),
      h('div', { class: 'row sec' },
        h('h2', { class: 'grow', style: 'margin:0' }, DAY[day] + '推荐 · ' + W.CITIES[p.city].name),
        h('div', { class: 'seg' }, ['sat', 'sun'].map((d) =>
          h('button', { class: day === d ? 'on' : '', on: { click: () => { day = d; rerender(); } } }, DAY[d]))),
        h('button', { class: 'btn acc', on: { click: () => blind(wx) } }, '🎲 帮我选一个')),
      h('div', { class: 'grid g2' }, ranked.map((r) => W.eventCard(r.ev, r))));
  }
  function blind(wx) {
    const r = W.rec.blindBox(S.prefs, wx);
    if (!r) return W.toast('这个城市暂时没有活动');
    const body = h('div', {}, W.eventCard(r.ev, r, { noActions: true }));
    W.modal('今天就它了！', body, [
      { label: '加入计划', cls: 'pri', fn: () => W.addToPlan(day, r.ev.id) },
      { label: '再抽一次', keep: false, fn: () => setTimeout(() => blind(wx), 50) }
    ]);
  }
  async function load() {
    const my = seq;
    wk = await W.weather.getWeekend(S.prefs.city);
    if (my === seq && W.route === 'discover') render(document.getElementById('view'));
  }
  W.views = W.views || {};
  W.views.discover = (root) => {
    render(root);
    seq++;
    load();
  };
})(window.WCG);
