(function (W) {
  const { h, S, save, mount, money, clamp } = W;

  function teamCard(t) {
    const ev = W.evById(t.evId);
    return h('article', { class: 'card ev' },
      h('div', { class: 'head' }, h('div', { class: 'emoji' }, ev ? W.CATS[ev.cat].icon : '👥'),
        h('div', { class: 'grow' }, h('h3', {}, t.title),
          h('div', { class: 'muted small' }, t.date + ' ' + t.time + ' · 集合：' + t.meet))),
      h('div', { class: 'meta' },
        h('span', { class: 'tag' }, t.members.length + '/' + t.cap + ' 人'),
        t.once ? h('span', { class: 'tag acc' }, '一期一会') : null,
        t.host ? h('span', { class: 'tag sun' }, '我是队长') : h('span', { class: 'tag' }, '已加入')),
      h('div', { class: 'row' },
        h('button', { class: 'btn sm pri', on: { click: () => { location.hash = '#/team/' + t.id; } } }, '查看 / 分享')));
  }

  function list(root) {
    mount(root,
      h('section', { class: 'hero' }, h('h1', {}, '组队出发'),
        h('p', {}, '一个人出门不自在？发起一个“一期一会”的小队：活动一结束就各回各家，不用维护关系。')),
      h('div', { class: 'row', style: 'margin-bottom:14px' },
        h('button', { class: 'btn pri', on: { click: () => { location.hash = '#/team/new'; } } }, '＋ 发起组队')),
      S.teams.length ? h('div', { class: 'grid g2' }, S.teams.map(teamCard))
        : h('div', { class: 'card empty' }, '还没有小队。先在「发现」里挑一个活动，点“发起组队”。'));
  }

  function form(root, evId) {
    const evs = W.events.filter((e) => e.city === S.prefs.city);
    const first = W.evById(evId) || evs[0];
    const f = { evId: first.id, date: W.nextWeekend(), time: '14:00', meet: '', cap: Math.min(first.max, 6), note: '', once: true };
    const field = (label, node) => h('div', {}, h('label', { class: 'f' }, label), node);
    mount(root, h('h1', {}, '发起组队'),
      h('div', { class: 'card' },
        field('选择活动', h('select', { on: { change: (e) => { f.evId = e.target.value; f.cap = Math.min(W.evById(f.evId).max, 6); } } },
          W.events.map((e) => h('option', { value: e.id, selected: e.id === f.evId }, W.CITIES[e.city].name + ' · ' + e.title)))),
        field('日期', h('input', { type: 'date', value: f.date, on: { change: (e) => { f.date = e.target.value; } } })),
        field('时间', h('input', { type: 'time', value: f.time, on: { change: (e) => { f.time = e.target.value; } } })),
        field('集合地点（建议选地铁口等公共场所）', h('input', { type: 'text', maxlength: 40, placeholder: '例如：地铁 2 号线 3 号口',
          on: { input: (e) => { f.meet = e.target.value; } } })),
        field('人数上限（含你）', h('input', { type: 'number', min: 2, max: 12, value: f.cap, on: { input: (e) => { f.cap = +e.target.value; } } })),
        field('给队友的话（可选）', h('textarea', { maxlength: 120, placeholder: '例如：新手友好，AA 制，下雨就改博物馆',
          on: { input: (e) => { f.note = e.target.value; } } })),
        h('label', { class: 'f' }, '相处方式'),
        h('button', { class: 'chip on', 'aria-pressed': 'true', on: { click: (e) => {
          f.once = !f.once; e.target.classList.toggle('on', f.once); e.target.setAttribute('aria-pressed', String(f.once));
        } } }, '一期一会：活动结束就散伙，不需要后续维护'),
        h('p', { class: 'ok', style: 'margin-top:12px' }, '安全默认：公共场所集合、白天结束、行程分享给室友。创建后可在详情页复制安全清单。'),
        h('div', { class: 'row', style: 'margin-top:12px' },
          h('button', { class: 'btn pri', on: { click: () => create(f) } }, '创建小队'),
          h('button', { class: 'btn ghost', on: { click: () => { location.hash = '#/team'; } } }, '取消'))));
  }

  function create(f) {
    const ev = W.evById(f.evId);
    if (!f.meet.trim()) return W.toast('请填写集合地点');
    if (!f.date) return W.toast('请选择日期');
    if (!(f.cap >= 2 && f.cap <= 12)) return W.toast('人数上限需在 2-12 之间');
    const t = { id: W.uid(), evId: f.evId, title: ev.title, date: f.date, time: f.time, meet: clamp(f.meet, 40),
      cap: f.cap, note: clamp(f.note, 120), once: f.once, host: true, extra: 0, members: [S.nick], created: Date.now() };
    S.teams.unshift(t); save();
    W.toast('小队已创建，复制邀请发给同学吧');
    location.hash = '#/team/' + t.id;
  }

  W.views = W.views || {};
  W.views.team = (root, arg) => {
    if (arg && arg.startsWith('new')) return form(root, arg.split('/')[1]);
    if (arg) return W.views.teamDetail(root, arg);
    list(root);
  };
})(window.WCG);
