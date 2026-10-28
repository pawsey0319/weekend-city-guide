(function (W) {
  const { h, S, save, toast, money } = W;
  function addToPlan(day, id) {
    const list = S.plan[day];
    if (list.includes(id)) return toast('已经在计划里了');
    if (list.length >= 3) return toast('每天最多安排 3 项，别排太满');
    list.push(id); save();
    toast('已加入' + (day === 'sat' ? '周六' : '周日') + '计划');
  }
  function pickDay(id) {
    W.modal('加入哪一天？', h('p', {}, '周末计划会帮你检查天气和强度是否平衡。'), [
      { label: '周六', cls: 'pri', fn: () => addToPlan('sat', id) },
      { label: '周日', cls: 'pri', fn: () => addToPlan('sun', id) }
    ]);
  }
  function eventCard(ev, sc, opt) {
    opt = opt || {};
    const cat = W.CATS[ev.cat];
    return h('article', { class: 'card ev' },
      h('div', { class: 'head' },
        h('div', { class: 'emoji', 'aria-hidden': 'true' }, cat.icon),
        h('div', { class: 'grow' }, h('h3', {}, ev.title), h('div', { class: 'muted small' }, ev.place)),
        sc ? h('div', { class: 'score', title: '综合匹配度' }, h('b', {}, sc.score), h('span', {}, '匹配')) : null),
      h('div', { class: 'meta' },
        h('span', { class: 'tag' }, cat.name),
        h('span', { class: 'tag sun' }, money(ev.price)),
        h('span', { class: 'tag' }, ev.indoor ? '室内' : '户外'),
        h('span', { class: 'tag' }, ev.hours + ' 小时'),
        h('span', { class: 'tag' }, ev.min + '-' + ev.max + ' 人'),
        h('span', { class: 'tag' }, W.ENERGY[ev.energy])),
      h('p', { class: 'small', style: 'margin:0' }, ev.desc),
      sc && sc.why.length ? h('ul', { class: 'why' }, sc.why.map((t) => h('li', {}, t))) : null,
      sc && sc.warn.length ? h('ul', { class: 'why w' }, sc.warn.map((t) => h('li', {}, t))) : null,
      h('details', {}, h('summary', { class: 'small muted' }, '小贴士'), h('p', { class: 'small' }, ev.tip)),
      opt.noActions ? null : h('div', { class: 'row' },
        h('button', { class: 'btn sm pri', on: { click: () => pickDay(ev.id) } }, '加入计划'),
        h('button', { class: 'btn sm', on: { click: () => { location.hash = '#/team/new/' + ev.id; } } }, '发起组队'),
        h('button', { class: 'btn sm ghost', on: { click: () => { location.hash = '#/checkin/' + ev.id; } } }, '我去过了')));
  }
  W.eventCard = eventCard;
  W.addToPlan = addToPlan;
})(window.WCG);
