(function (W) {
  const { h, S, save, mount, clamp } = W;
  let tab = 'all', cityF = '';

  const all = () => S.guides.concat(W.seedGuides);
  const isMine = (g) => S.guides.some((x) => x.id === g.id);
  const likes = (g) => g.likes + (S.liked.includes(g.id) ? 1 : 0);
  const toggle = (arr, id) => { const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id); save(); };

  function shareObj(g) { return { t: g.title, c: g.city, $: g.cost, g: g.tags, s: g.stops, p: g.tips, a: g.author }; }
  function guideText(g) {
    return ['【' + W.CITIES[g.city].name + '周末攻略】' + g.title, '预算：约 ¥' + g.cost,
      ...g.stops.map((s, i) => (i + 1) + '. ' + s), '提示：' + g.tips, '—— ' + W.shareUrl('g', shareObj(g))].join('\n');
  }
  function card(g, root) {
    return h('article', { class: 'card ev' },
      h('div', { class: 'head' }, h('div', { class: 'emoji' }, '📖'),
        h('div', { class: 'grow' }, h('h3', {}, g.title),
          h('div', { class: 'muted small' }, W.CITIES[g.city].name + ' · ' + g.author + ' · 预算约 ¥' + g.cost))),
      h('div', { class: 'meta' }, g.tags.map((t) => h('span', { class: 'tag' }, t))),
      h('ol', { class: 'stops' }, g.stops.map((s) => h('li', {}, s))),
      h('p', { class: 'small muted', style: 'margin:0' }, '小提示：' + g.tips),
      h('div', { class: 'row' },
        h('button', { class: 'btn sm' + (S.liked.includes(g.id) ? ' pri' : ''), 'aria-pressed': String(S.liked.includes(g.id)),
          on: { click: () => { toggle(S.liked, g.id); render(root); } } }, '👍 ' + likes(g)),
        h('button', { class: 'btn sm' + (S.saved.includes(g.id) ? ' pri' : ''), 'aria-pressed': String(S.saved.includes(g.id)),
          on: { click: () => { toggle(S.saved, g.id); render(root); } } }, S.saved.includes(g.id) ? '已收藏' : '收藏'),
        h('button', { class: 'btn sm', on: { click: () => W.copy(guideText(g)) } }, '复制分享'),
        h('button', { class: 'btn sm', on: { click: () => W.showPoster({ title: g.title, sub: W.CITIES[g.city].name + ' · 约 ¥' + g.cost,
          lines: g.stops, foot: '周末城市探索指南' }) } }, '海报'),
        isMine(g) ? h('button', { class: 'btn sm ghost', on: { click: () => {
          if (!confirm('删除这篇攻略？')) return; S.guides = S.guides.filter((x) => x.id !== g.id); save(); render(root);
        } } }, '删除') : null));
  }
  function form(root) {
    const f = { title: '', city: S.prefs.city, cost: 50, tags: '', stops: '', tips: '' };
    const set = (k, num) => (e) => { f[k] = num ? Math.max(0, +e.target.value || 0) : e.target.value; };
    return h('section', { class: 'card' }, h('h2', {}, '写一篇攻略'),
      h('label', { class: 'f' }, '标题'), h('input', { type: 'text', maxlength: 40, placeholder: '例如：50 元玩转周六', on: { input: set('title') } }),
      h('label', { class: 'f' }, '城市'), h('select', { on: { change: set('city') } },
        Object.entries(W.CITIES).map(([k, c]) => h('option', { value: k, selected: k === f.city }, c.name))),
      h('label', { class: 'f' }, '人均预算（元）'), h('input', { type: 'number', min: 0, max: 9999, value: f.cost, on: { input: set('cost', true) } }),
      h('label', { class: 'f' }, '标签（逗号分隔）'), h('input', { type: 'text', maxlength: 40, placeholder: '低预算, 雨天友好', on: { input: set('tags') } }),
      h('label', { class: 'f' }, '路线（每行一站，最多 6 站）'), h('textarea', { maxlength: 300, on: { input: set('stops') } }),
      h('label', { class: 'f' }, '小提示'), h('textarea', { maxlength: 200, on: { input: set('tips') } }),
      h('div', { class: 'row', style: 'margin-top:14px' },
        h('button', { class: 'btn pri', on: { click: () => {
          const stops = f.stops.split('\n').map((s) => clamp(s.trim(), 40)).filter(Boolean).slice(0, 6);
          if (!f.title.trim() || !stops.length) return W.toast('请填写标题和至少一站路线');
          const tags = f.tags.split(/[,，]/).map((s) => clamp(s.trim(), 8)).filter(Boolean).slice(0, 5);
          S.guides.unshift({ id: 'u' + W.uid(), city: f.city, title: clamp(f.title, 40), cost: f.cost, tags, stops,
            tips: clamp(f.tips, 200) || '暂无', author: S.nick, likes: 0 });
          save(); W.toast('已发布到本机攻略库'); tab = 'mine'; render(root);
        } } }, '发布'),
        h('button', { class: 'btn ghost', on: { click: () => render(root) } }, '取消')));
  }
  function render(root) {
    let gs = all();
    if (tab === 'mine') gs = S.guides; else if (tab === 'saved') gs = gs.filter((g) => S.saved.includes(g.id));
    if (cityF) gs = gs.filter((g) => g.city === cityF);
    const tabs = [['all', '全部'], ['saved', '收藏'], ['mine', '我的']];
    mount(root,
      h('section', { class: 'hero' }, h('h1', {}, '攻略分享'), h('p', {}, '把你的周末路线写下来，复制或做成海报发给同学。')),
      h('div', { class: 'row', style: 'margin-bottom:14px' },
        h('div', { class: 'seg' }, tabs.map(([k, l]) => h('button', { class: tab === k ? 'on' : '', on: { click: () => { tab = k; render(root); } } }, l))),
        h('select', { style: 'width:auto', 'aria-label': '城市筛选', on: { change: (e) => { cityF = e.target.value; render(root); } } },
          h('option', { value: '' }, '全部城市'), Object.entries(W.CITIES).map(([k, c]) => h('option', { value: k, selected: k === cityF }, c.name))),
        h('button', { class: 'btn pri', on: { click: () => mount(root, form(root)) } }, '＋ 写攻略')),
      gs.length ? h('div', { class: 'grid g2' }, gs.map((g) => card(g, root))) : h('div', { class: 'card empty' }, '这里还没有内容。'));
  }
  function shared(root, raw) {
    let p; try { p = W.dec(raw); } catch (e) { p = null; }
    if (!p || !W.CITIES[p.c] || !Array.isArray(p.s)) return mount(root, h('div', { class: 'card empty' }, '分享链接无法识别。', h('br'), h('a', { href: '#/guides' }, '看看别的攻略')));
    const g = { id: 'u' + W.uid(), city: p.c, title: clamp(p.t, 40), cost: Math.max(0, parseInt(p.$, 10) || 0),
      tags: (Array.isArray(p.g) ? p.g : []).slice(0, 5).map((x) => clamp(x, 8)), stops: p.s.slice(0, 6).map((x) => clamp(x, 40)),
      tips: clamp(p.p, 200), author: clamp(p.a, 12) || '同学', likes: 0 };
    mount(root, h('p', { class: 'note' }, '这是别人分享给你的攻略，内容来自链接，请自行判断。'), card(g, root),
      h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn pri', on: { click: () => {
        S.guides.unshift(g); S.saved.push(g.id); save(); W.toast('已保存'); location.hash = '#/guides';
      } } }, '保存到我的攻略库')));
  }
  W.views = W.views || {};
  W.views.guides = (root) => render(root);
  W.views.g = shared;
})(window.WCG);
